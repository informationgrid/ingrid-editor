/**
 * ==================================================
 * Copyright (C) 2022-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.ServerException.Companion.withReason
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.TransformUtils.getRdfModel
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.RecordPLUProperties
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch.Agent
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch.Contact
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch.Distribution
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch.PeriodOfTime
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.elasticsearch.ProcessStep
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.DocTypeEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.PlanStateEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.PlanTypeEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.ProcedureStateEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.ProcedureTypeEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.enums.ProcessStepTypeEnum
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.util.ValidationUtils
import org.apache.http.client.utils.URIBuilder
import org.apache.jena.rdf.model.Literal
import org.apache.jena.rdf.model.Model
import org.apache.jena.rdf.model.RDFNode
import org.apache.jena.rdf.model.Resource
import org.apache.jena.rdf.model.Statement
import org.apache.jena.riot.Lang
import org.apache.jena.riot.RiotException
import org.apache.jena.vocabulary.DCTerms
import org.apache.jena.vocabulary.RDF
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import org.springframework.web.util.UriComponentsBuilder
import java.io.IOException
import java.net.URISyntaxException
import java.time.Instant
import java.util.*
import java.util.function.Consumer
import java.util.function.Function

@Component
class RdfDeserializer(@Autowired val mapper: ObjectMapper, @Autowired val validationUtils: ValidationUtils) : Deserializer {

    val uuidPattern = Regex("[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}")

    init {
        // make sure we don't get an XmlMapper
        require(mapper !is XmlMapper) { "XmlMapper cannot be used to deserialize GeoJson." }
    }

    @Throws(ServerException::class)
    override fun deserializeRecord(serializedRecordProperties: String?): RecordPLUProperties? {
        try {
            val model = getRdfModel(serializedRecordProperties, Lang.RDFXML)
//            validationUtils.validateSyntax(model)
            val datasetProperty = model.getProperty(model.getNsPrefixURI("dcat"), "Dataset")

            val records: MutableList<RecordPLUProperties> = ArrayList()
            val it = model.listSubjectsWithProperty(RDF.type, datasetProperty)
            while (it.hasNext()) {
                val dataset = it.next()
                try {
                    records.add(parseDataset(model, dataset))
                } catch (e: IOException) {
                    throw withReason("Error while parsing RDF model into Record", e)
                }
            }

            // TODO handle cases where more than one dataset is given in one bulk operation
            return if (records.isEmpty()) null else records[0]
        } catch (e: RiotException) {
//            String msg = String.format("Input RDF data could not be parsed: %s", ApiException.extractExceptionTitle(e));
            throw withReason("Input RDF data could not be parsed", e)
        }
    }

    /*@Override
    public CollectionProperties deserializeCollection(String serializedCollection) throws ServerException {
        try {
            Model model = TransformUtils.getRdfModel(serializedCollection, Lang.RDFXML);
            validationUtils.validateSyntax(model);
            Property datasetProperty = model.getProperty(model.getNsPrefixURI("dcat"), "Catalog");

            List<CollectionProperties> collections = new ArrayList<>();
            for (ResIterator it = model.listSubjectsWithProperty(RDF.type, datasetProperty); it.hasNext();) {
                Resource catalog = it.next();
                CollectionProperties collection = parseCatalog(model, catalog);
                collections.add(collection);
            }

            if (collections.isEmpty()) {
                String msg = "Request body did not contain catalog information";
                throw new ApiException(HttpStatus.BAD_REQUEST, msg);
            }
            // TODO handle cases where more than one catalog is given in one bulk operation
            return collections.get(0);
        }
        catch (RiotException e) {
            String msg = String.format("Input RDF data could not be parsed: %s", ApiException.extractExceptionTitle(e));
            throw new ApiException(HttpStatus.BAD_REQUEST, msg, e);
        }
    }

    private CollectionProperties parseCatalog(Model model, Resource catalog) throws ServerException {
        CollectionProperties properties = new CollectionProperties();
        properties.setIdentifier(str(model, catalog, "dct", "identifier"));
        properties.setThemeTaxonomy(str(model, catalog, "dct", "themeTaxonomy"));
        properties.setIssued(instant(model, catalog, "dct", "issued"));
        properties.setLanguage(str(model, catalog, "dct", "language"));
        properties.setModified(instant(model, catalog, "dct", "modified"));
        properties.setDescription(str(model, catalog, "dct", "description"));
        properties.setTitle(str(model, catalog, "dct", "title"));
        properties.setHomepage(str(model, catalog, "foaf", "homepage"));
        Iterator<Agent> publishers = createAgents(model, catalog, "dct", "publisher").iterator();
        properties.setPublisher(publishers.hasNext() ? publishers.next() : null);
        return properties;
    }*/
    @Throws(ServerException::class, IOException::class)
    private fun parseDataset(model: Model, dataset: Resource): RecordPLUProperties {
        val record = RecordPLUProperties()
        record.admsIdentifier = str(model, dataset, "adms", "identifier")
        record.contact = createContact(model, dataset, "dcat", "contactPoint")
        record.contributors = createAgents(model, dataset, "dct", "contributor")
        record.description = dataset.getProperty(DCTerms.description)?.string
        val distributionsAsMaps = createSetOfMaps(model, dataset, "dcat", "distribution", distributionProperties)
        if (distributionsAsMaps.isNotEmpty()) {
            record.distributions = mapsToDistributions(distributionsAsMaps)
        }
        record.identifier = dataset.getProperty(DCTerms.identifier).string ?: run {
            // if not explicit identifier then use the one from URI
            uuidPattern.find(dataset.uri)?.value
        }
        record.issued = instant(model, dataset, "dct", "issued")
        record.maintainers = createAgents(model, dataset, "dcatde", "maintainer")
        record.modified = instant(model, dataset, "dct", "modified")
        record.notification = str(model, dataset, "plu", "notification")
        record.planName = str(model, dataset, "plu", "planName")
        record.planState = PlanStateEnum.fromValue(str(model, dataset, "plu", "planState"))
        record.planType = PlanTypeEnum.fromValue(str(model, dataset, "plu", "planType"))
        record.planTypeFine = str(model, dataset, "plu", "planTypeFine")
        record.procedurePeriod = handleProperties(
            model,
            dataset,
            listOf("procedurePeriod"),
        )["procedurePeriod"] as PeriodOfTime?
        // TODO refactor to remove procedureStartDate handling once k1 and k3 have updated
        if (record.procedurePeriod != null && record.procedurePeriod!!.startDate != null) {
            record.procedureStartDate = record.procedurePeriod!!.startDate
        } else {
            val procedureStartDate = instant(model, dataset, "plu", "procedureStartDate")
            record.procedureStartDate = procedureStartDate
            val procedurePeriod = PeriodOfTime()
            procedurePeriod.startDate = procedureStartDate
            record.procedurePeriod = procedurePeriod
        }
        record.procedureState = ProcedureStateEnum.fromValue(str(model, dataset, "plu", "procedureState"))
        record.procedureType = ProcedureTypeEnum.fromValue(str(model, dataset, "plu", "procedureType"))
        val processStepsAsMaps = createSetOfMaps(model, dataset, "plu", "processStep", processStepProperties)
        if (!processStepsAsMaps.isEmpty()) {
            record.processSteps = mapsToProcessSteps(processStepsAsMaps)
        }
        record.developmentFreezePeriod = handleProperties(
            model,
            dataset,
            listOf("developmentFreezePeriod"),
        )["developmentFreezePeriod"] as PeriodOfTime?
        val publishers = createAgents(model, dataset, "dct", "publisher").iterator()
        record.publisher = if (publishers.hasNext()) publishers.next() else null
        record.relation = dataset.getProperty(DCTerms.relation)?.string
        record.title = dataset.getProperty(DCTerms.title)?.string
//        record.themes = model.listObjectsOfProperty(DCAT.theme)

        val location = res(model, dataset, "dct", "spatial")
        /*if (location == null) {
            val msg = "dct:spatial must not be null"
            throw withReason(msg, null)
        }*/
        // TODO check if the geometric elements are wrapped in a <dct:Location>
        if (location != null) {
            record.bbox = createGeoShape(model, location, "dcat", "bbox")
            record.geometry = createGeoShape(model, location, "locn", "geometry")
            val geoPointMap = createGeoShape(model, location, "dcat", "centroid")
            if (geoPointMap != null) {
                val geoPoint = geoPointMap["coordinates"] as List<Double>?
                record.centroid = geoPoint!!.toTypedArray<Double>()
            }
            record.geographicName = str(model, location, "locn", "geographicName")
        }
        return record
    }

    private fun statement(model: Model, parent: Resource?, ns: String, localname: String): Statement = parent!!.getProperty(model.getProperty(model.getNsPrefixURI(ns), localname))

    private fun obj(model: Model, parent: Resource?, ns: String, localname: String): RDFNode? {
        val s = parent!!.getProperty(model.getProperty(model.getNsPrefixURI(ns), localname))
        return if (s == null) null else statement(model, parent, ns, localname).getObject()
    }

    private fun lit(model: Model, parent: Resource, ns: String, localname: String): Literal? {
        val n = obj(model, parent, ns, localname)
        return if (n == null || !n.isLiteral) null else n.asLiteral()
    }

    private fun res(model: Model, parent: Resource, ns: String, localname: String): Resource? {
        val n = obj(model, parent, ns, localname)
        return if (n == null || !n.isResource) null else n.asResource()
    }

    private fun str(model: Model, parent: Resource?, ns: String, localname: String): String? {
        val n = obj(model, parent, ns, localname)
        if (n == null) {
            return null
        } else if (n.isLiteral) {
            val l = n.asLiteral()
            return l?.string
        } else if (n.isResource) {
            val r = n.asResource()
            if (ns == "adms" && localname == "identifier") {
                return str(model, r, "skos", "notation")
            }
            return r?.toString()
        } else {
            return null
        }
    }

    private fun instant(model: Model, parent: Resource, ns: String, localname: String): Instant? {
        val l = lit(model, parent, ns, localname) ?: return null
        // TODO:        return InstantConverter.parseLenient(l.getString());
        return Instant.now()
    }

    @Throws(ServerException::class)
    private fun createContact(model: Model, dataset: Resource, ns: String, localname: String): Contact? {
        val p = model.getProperty(model.getNsPrefixURI(ns), localname)
        val it = model.listObjectsOfProperty(dataset, p)
        while (it.hasNext()) {
            val nextNode = it.next()
            if (!nextNode.isResource) {
                throw withReason("contactPoint must contain Organization or Person", null)
            }
            val objectResource = nextNode.asResource()

            val vcardProp = Function { prop: String? ->
                val vcardProperty = model.getProperty(model.getNsPrefixURI("vcard"), prop)
                val propStatement = objectResource.getProperty(vcardProperty) ?: return@Function null
                propStatement.getObject().toString()
            }

            val contact = Contact()
            contact.fn = vcardProp.apply("fn")
            contact.hasOrganizationName = vcardProp.apply("hasOrganizationName")
            contact.hasPostalCode = vcardProp.apply("hasPostalCode")
            contact.hasStreetAddress = vcardProp.apply("hasStreetAddress")
            contact.hasLocality = vcardProp.apply("hasLocality")
            contact.hasRegion = vcardProp.apply("hasRegion")
            contact.hasCountryName = vcardProp.apply("hasCountryName")
            contact.hasEmail = vcardProp.apply("hasEmail")
            contact.hasTelephone = vcardProp.apply("hasTelephone")

            // only use the first found contact
            return contact
        }
        return null
    }

    private fun createSetOfMaps(
        model: Model,
        dataset: Resource,
        ns: String,
        localname: String,
        allowedProperties: List<String>,
    ): Set<Map<String, Any>> {
        val p = model.getProperty(model.getNsPrefixURI(ns), localname)
        val maps: MutableSet<Map<String, Any>> = HashSet()
        val it = model.listObjectsOfProperty(dataset, p)
        while (it.hasNext()) {
            val objectResource = it.next().asResource()
            maps.add(handleProperties(model, objectResource, allowedProperties))
        }
        return maps
    }

    private fun handleProperties(model: Model, resource: Resource, allowedProperties: List<String>): Map<String, Any> {
        val propMap: MutableMap<String, Any> = HashMap()
        resource.listProperties().forEach { statement: Statement ->
            val nameSpace = statement.predicate.nameSpace
            val localName = statement.predicate.localName
            val valueNode = statement.getObject()
            if (allowedProperties.contains(localName)) {
                // handle temporal/developmentFreezePeriod/procedurePeriod separately
                if (rangeProperties.contains(localName)) {
                    val periodOfTime = PeriodOfTime()
                    // startDate
                    val startDate = model.getProperty(model.getNsPrefixURI("dcat"), "startDate")
                    val startDateStmt = model.getProperty(valueNode.asResource(), startDate)
                    if (startDateStmt != null) {
                        val startDateValue = startDateStmt.getObject()
                        if (startDateValue != null && startDateValue.isLiteral) {
// TODO:                            periodOfTime.setStartDate(InstantConverter.parseLenient(startDateValue.asLiteral().getString()));
                        }
                    }
                    // endDate
                    val endDate = model.getProperty(model.getNsPrefixURI("dcat"), "endDate")
                    val endDateStmt = model.getProperty(valueNode.asResource(), endDate)
                    if (endDateStmt != null) {
                        val endDateValue = endDateStmt.getObject()
                        if (endDateValue != null && endDateValue.isLiteral) {
// TODO:                            periodOfTime.setEndDate(InstantConverter.parseLenient(endDateValue.asLiteral().getString()));
                        }
                    }
                    propMap[localName] = periodOfTime
                } else if (localName == "distribution") {
                    var distributions = propMap["distributions"] as MutableSet<Map<String, Any>?>?
                    if (distributions == null) {
                        distributions = HashSet()
                    }
                    distributions.add(handleProperties(model, valueNode.asResource(), distributionProperties))
                    propMap["distributions"] = distributions
                    //                    propMap.put(localName, handleProperties(model, valueNode.asResource(), distributionProperties));
                } else {
                    val value = if (valueNode.isLiteral) valueNode.asLiteral().string else valueNode.toString()
                    propMap[localName] = value
                }
            } else {
//                log.warn("Ignoring unspecified property \"" + tag + "\"");
            }
        }
        return propMap
    }

    @Throws(ServerException::class, IOException::class)
    private fun createGeoShape(model: Model, location: Resource, ns: String, localname: String): Map<String, Any>? {
        val p = model.getProperty(model.getNsPrefixURI(ns), localname)
        val it = model.listObjectsOfProperty(location, p)
        while (it.hasNext()) {
            val currentNode = it.next()
            // handle GeoJSON
            if (currentNode.isLiteral) {
                val nodeValue = currentNode.asLiteral().string.trim()
                val jsonNode = mapper.readTree(nodeValue)
                val typeNode = jsonNode["type"]
                    ?: throw withReason("GeoJSON must contain \"type\" property", null)
                val type = typeNode.textValue()
                if ("FeatureCollection" == type) {
                    val featuresNode = jsonNode["features"]
                        ?: throw withReason("FeatureCollection must contain \"features\" property", null)
                    val geometries = mapper.createArrayNode()
                    featuresNode.forEach(
                        Consumer { feature: JsonNode ->
                            geometries.add(
                                feature["geometry"],
                            )
                        },
                    )
                    val objectNode = mapper.createObjectNode()
                    objectNode.set<JsonNode>(
                        "type",
                        mapper.convertValue("GeometryCollection", JsonNode::class.java),
                    )
                    objectNode.set<JsonNode>("geometries", geometries)
                    return mapper.readValue(objectNode.toString(), Map::class.java) as Map<String, Any>
                } else if ("Feature" == type) {
                    val geometryNode = jsonNode["geometry"]
                        ?: throw withReason("Feature must contain \"geometry\" property", null)
                    return mapper.readValue(jsonNode["geometry"].toString(), MutableMap::class.java) as Map<String, Any>
                } else if (legalGeometries.contains(type)) {
                    return mapper.readValue(nodeValue, MutableMap::class.java) as Map<String, Any>
                } else {
                    throw withReason("GeoJSON must contain a valid type, was \"$type\"", null)
                }
            } else {
                log.warn("A non-GeoJSON entry was supplied - this is currently not supported")
                throw UnsupportedOperationException("GML is not supported yet.")
            }
        }
        return null
    }

    @Throws(ServerException::class)
    private fun createAgents(model: Model, dataset: Resource, ns: String, localname: String): Set<Agent> {
        val p = model.getProperty(model.getNsPrefixURI(ns), localname)
        val agents: MutableSet<Agent> = HashSet()
        val it = model.listObjectsOfProperty(dataset, p)
        while (it.hasNext()) {
            val agentNode = it.next()
            if (agentNode.isResource) {
                val agentResource = agentNode.asResource()
                val agent = Agent()
                val agentName = obj(model, agentResource, "foaf", "name")
                if (agentName != null) {
                    agent.name = agentName.asLiteral().string
                }
                val agentType = res(model, agentResource, "dct", "type")
                if (agentType != null) {
                    agent.type = agentType.asNode().uri
                }
                agents.add(agent)
            } else {
                val msg = "foaf:Agent must not be null"
                throw withReason(msg, null)
            }
        }
        return agents
    }

    @Throws(ServerException::class)
    private fun mapsToDistributions(distributionsAsMaps: Set<Map<String, Any>>?): Set<Distribution> {
        val distributions: MutableSet<Distribution> = HashSet()
        for (distributionAsMap in distributionsAsMaps!!) {
            val distribution = Distribution()
            // TODO this is only a legacy band-aid solution
            // TODO remove the WMS exemption when k1 and k3 deliver the new format (meanwhile, we handle both)
            var format = distributionAsMap["format"] as String?
            //            format = StringUtils.substringAfterLast(format, '/');
            if (format != null && format.endsWith("WMS")) {
                format = "WMS"
            }
            distribution.accessURL = cleanURL(distributionAsMap["accessURL"], format)
            distribution.downloadURL = distributionAsMap["downloadURL"] as String?
            distribution.description = distributionAsMap["description"] as String?
            distribution.docType = DocTypeEnum.fromValue(distributionAsMap["docType"] as String?)
            distribution.format = if (format == null) emptyArray() else arrayOf(format)
            // TODO:            distribution.setIssued(InstantConverter.parseLenient(distributionAsMap.get("issued")));
            val mapLayerNames = distributionAsMap["mapLayerNames"] as String?
            if (mapLayerNames != null) {
                distribution.mapLayerNames =
                    mapLayerNames.split(",".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
            }
            // TODO:           distribution.setModified(InstantConverter.parseLenient(distributionAsMap.get("modified")));
            distribution.title = distributionAsMap["title"] as String?
            distribution.temporal = distributionAsMap["temporal"] as PeriodOfTime?
            distributions.add(distribution)
        }
        return distributions
    }

    @Throws(ServerException::class)
    private fun cleanURL(accessURL: Any?, format: String?): String? {
        val replaceableParams: List<String> = mutableListOf("request", "service", "version")
        // only clean WMS URLs
        if ("WMS" != format) {
            return accessURL as String?
        }
        try {
            val uriComponentsBuilder = UriComponentsBuilder.fromUriString(accessURL as String?)
            val uriBuilder = URIBuilder(accessURL)
            for (entry in uriBuilder.queryParams) {
                if (replaceableParams.contains(entry.name.lowercase(Locale.getDefault()))) {
                    uriComponentsBuilder.replaceQueryParam(entry.name, null as Array<Any?>?)
                }
            }
            return uriComponentsBuilder.build().toUriString()
        } catch (e: URISyntaxException) {
            throw withReason("Problem", e)
        }
    }

    @Throws(ServerException::class)
    private fun mapsToProcessSteps(processStepsAsMaps: Set<Map<String, Any>>): Set<ProcessStep> {
        val processSteps: MutableSet<ProcessStep> = HashSet()
        for (processStepAsMap in processStepsAsMaps) {
            val processStep = ProcessStep()
            processStep.identifier = processStepAsMap["identifier"] as String?
            processStep.passNumber = processStepAsMap["passNumber"] as String?
            processStep.processStepType = ProcessStepTypeEnum.fromValue(processStepAsMap["processStepType"] as String?)
            processStep.temporal = processStepAsMap["temporal"] as PeriodOfTime?
            processStep.title = processStepAsMap["title"] as String?
            if (processStepAsMap.containsKey("distributions")) {
                processStep.distributions =
                    mapsToDistributions(processStepAsMap["distributions"] as Set<Map<String, Any>>?)
            }
            processSteps.add(processStep)
        }
        return processSteps
    }

    companion object {
        private val log: Logger = LoggerFactory.getLogger(RdfDeserializer::class.java)

        private val distributionProperties: List<String> = mutableListOf(
            "accessURL",
            "description",
            "docType",
            "downloadURL",
            "format",
            "issued",
            "mapLayerNames",
            "modified",
            "temporal",
            "title",
        )
        private val processStepProperties: List<String> =
            mutableListOf("identifier", "distribution", "passNumber", "processStepType", "temporal", "title")
        private val rangeProperties: List<String> =
            mutableListOf("developmentFreezePeriod", "procedurePeriod", "temporal")
        private val legalGeometries: List<String> = mutableListOf(
            "Point",
            "LineString",
            "Polygon",
            "MultiPoint",
            "MultiLineString",
            "MultiPolygon",
            "GeometryCollection",
        )
    }
}
