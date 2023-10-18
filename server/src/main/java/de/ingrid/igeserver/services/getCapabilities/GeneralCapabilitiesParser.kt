package de.ingrid.igeserver.services.getCapabilities

import de.ingrid.igeserver.model.BoolFilter
import de.ingrid.igeserver.model.ResearchQuery
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.utils.xpath.XPathUtils
import org.apache.commons.lang3.ArrayUtils
import org.apache.logging.log4j.kotlin.logger
import org.w3c.dom.Document
import org.w3c.dom.Node
import java.text.ParseException
import java.text.SimpleDateFormat
import java.util.*


data class GeoDataset(
    var uuid: String? = null,
    var objectIdentifier: String? = null,
    var title: String? = null,
    var spatialReferences: List<LocationBean>? = null,
    var objectClass: String? = null,
    var description: String? = null,
    var spatialSystems: List<KeyValue>? = null,
    var keywords: List<String>? = null,
    var exists: Boolean = false
)

data class OperationBean(
    var addressList: List<String>? = null,
    var platform: List<Int>? = null,
    var methodCall: String? = null,
    var name: KeyValue? = null
)

data class TimeReferenceBean(var type: Int = -1, var date: Date? = null, var from: Date? = null, var to: Date? = null)
data class ConformityBean(var level: Int? = null, var specification: String? = null)
data class AddressBean(
    var uuid: String? = null,
    var type: String? = null,
    var _state: String? = null,
    var exists: Boolean = false,
    var firstName: String? = null,
    var lastName: String? = null,
    var email: String? = null,
    var organization: String? = null,
    var street: String? = null,
    var city: String? = null,
    var postcode: String? = null,
    var country: KeyValue? = null,
    var state: KeyValue? = null,
    var phone: String? = null,
)

data class UrlBean(
    var url: String? = null,
    var type: KeyValue? = null,
    var title: String? = null,
    var explanation: String? = null
)

data class LocationBean(
    var latitude1: Double? = null,
    var longitude1: Double? = null,
    var latitude2: Double? = null,
    var longitude2: Double? = null,
    var name: String? = null,
    var type: String? = null
)

class CapabilitiesBean {
    var serviceType: String? = null
    var dataServiceType: String? = null
    var title: String? = null
    var description: String? = null
    var versions: List<KeyValue>? = emptyList()
    var fees: KeyValue? = null
    var accessConstraints: List<KeyValue>? = emptyList()
    var onlineResources: List<UrlBean>? = emptyList()
    var keywords = mutableListOf<String>()
    var boundingBoxes: List<LocationBean>? = emptyList()
    var spatialReferenceSystems: List<KeyValue>? = emptyList()
    var address: AddressBean? = null
    var operations: List<OperationBean>? = emptyList()
    var resourceLocators: List<UrlBean>? = emptyList()
    var timeReference = mutableListOf<TimeReferenceBean>()
    var timeSpan: TimeReferenceBean? = null
    var conformities = listOf<ConformityBean>()
    var coupledResources = listOf<GeoDataset>()
}

data class KeyValue(val key: String?, val value: String?)

/**
 * @author André
 */
open class GeneralCapabilitiesParser(open val xPathUtils: XPathUtils, val codelistHandler: CodelistHandler) {

    val log = logger()

    protected fun getKeywords(doc: Node?, xpath: String?): MutableList<String> {
        return xPathUtils.getStringArray(doc, xpath)
            .toSet()
            .filter { it.isNotEmpty() }
            .toMutableList()
    }

    protected fun transformKeywordListToStrings(keywords: List<String?>): List<String> {
        val snsTopics: MutableList<String> = ArrayList()
        for (keyword in keywords) {
            val snsTopic = "???"
            snsTopics.add(snsTopic)
        }
        return snsTopics
    }

    protected fun mapToOperationBean(
        doc: Document,
        xPathsOfMethods: Array<String>,
        platformsOfMethods: Array<Int>
    ): OperationBean {
        val opBean = OperationBean()
        val methodAddresses = mutableListOf<String>()
        val methodPlatforms = mutableListOf<Int>()
        for (i in xPathsOfMethods.indices) {
            val methodAddress = xPathUtils.getString(doc, xPathsOfMethods[i])
            if (methodAddress != null && methodAddress.isNotEmpty()) {
                methodAddresses.add(methodAddress)
                methodPlatforms.add(platformsOfMethods[i])
            }
        }
        opBean.platform = methodPlatforms
        opBean.addressList = methodAddresses
        return opBean
    }

    protected fun mapToTimeReferenceBean(doc: Document, xPath: String): TimeReferenceBean? {
        val date = xPathUtils.getString(doc, xPath)
        // determine type of date 
        val dateType = getDateType(xPath)

        if (date != null && dateType != null) {
            return TimeReferenceBean(
                dateType,
                this.getSimpleDate(date)
            )
        }

        return null
    }

    private fun getSimpleDate(date: String): Date? {
        return try {
            SimpleDateFormat("yyyy-MM-dd").parse(date)
        } catch (e: ParseException) {
            log.debug("Error on getSimpleDate", e)
            null
        }
    }

    private fun mapToConformityBeans(doc: Document, xPath: String): List<ConformityBean> {
        val beans = mutableListOf<ConformityBean>()
        val conformityNodes = xPathUtils.getNodeList(doc, xPath)
        if (conformityNodes != null) {

            for (index in 0 until conformityNodes.length) {
                val bean = ConformityBean()
                val degree =
                    getConformityDegree(xPathUtils.getString(conformityNodes.item(index), "inspire_common:Degree"))
                bean.level = degree
                // TODO: convert title to specific language!?
                bean.specification = xPathUtils.getString(
                    conformityNodes.item(index),
                    "inspire_common:Specification/inspire_common:Title"
                )
                beans.add(bean)
            }
        }
        return beans
    }

    private fun getConformityDegree(value: String?): Int? {
        if (value == null) return null

        // set result to "not evaluated" by default!
        var confKey = 3
        if ("conformant" == value) {
            confKey = 1
        } else if ("not conformant" == value) {
            confKey = 2
        }
        return confKey
    }

    private fun getDateType(xPath: String): Int? {
        if (xPath.indexOf("DateOfPublication") != -1) return 2 else if (xPath.indexOf("DateOfCreation") != -1) return 1 else if (xPath.indexOf(
                "DateOfLastRevision"
            ) != -1
        ) return 3
        return null
    }

    /**
     * This method extracts first- and lastname from a string. Depending on if there
     * is a "," the order is reversed!
     * @param name
     * @return
     */
    private fun extractName(name: String?): Array<String> {
        if (name != null) {
            val splitByComma = name.trim().split(",".toRegex()).dropLastWhile { it.isEmpty() }
                .toTypedArray()
            return if (splitByComma.size > 1) {
                arrayOf(splitByComma[1].trim(), splitByComma[0].trim())
            } else {
                val splitBySpace = name.split(" ".toRegex()).dropLastWhile { it.isEmpty() }
                    .toTypedArray()
                if (splitBySpace.size == 2) {
                    arrayOf(splitBySpace[0].trim(), splitBySpace[1].trim())
                } else if (splitBySpace.size > 2) {
                    val sub = splitBySpace.copyOfRange(0, splitBySpace.size - 1)
                    arrayOf(sub.joinToString(" "), splitBySpace[splitBySpace.size - 1].trim())
                } else {
                    arrayOf("", name.trim())
                }
            }
        }
        return emptyArray()
    }

    /**
     * Extract first and last name from name string and deploy a given
     * AddressBean with it. If no first name can be detected, use the
     * complete name string as last name
     */
    protected fun setNameInAddressBean(ab: AddressBean, name: String?): AddressBean {
        val nameParts = this.extractName(name)
        if (nameParts.isEmpty()) {
            ab.lastName = "N/A"
        } else if (nameParts.size == 1) {
            ab.lastName = nameParts[0]
        } else if (nameParts.size == 2) {
            ab.firstName = nameParts[0]?.trim()
            ab.lastName = nameParts[1]?.trim()
        }
        return ab
    }

    protected fun getNodesContentAsList(doc: Document, xPath: String): List<String> {
        val versionNodes = xPathUtils.getNodeList(doc, xPath)
        val list = mutableListOf<String>()
        if (versionNodes == null) return list
        for (i in 0 until versionNodes.length) {
            val content = versionNodes.item(i).textContent
            if (content.trim().isNotEmpty()) {
                list.add(content)
            }
        }
        return list
    }

    protected fun mapVersionsFromCodelist(
        listId: String,
        versionList: List<String>,
        versionSyslistMap: Map<String, String>
    ): List<KeyValue> {
        return versionList.map {
            val entryId = versionSyslistMap[it]
            if (entryId != null) {
                val value = codelistHandler.getCodelistValue(listId, entryId.toString())
                if (value == null) {
                    log.warn("Version could not be mapped!")
                }
                KeyValue(entryId, value)
            } else KeyValue(null, it)
        }.toSet().toList()
    }

    protected fun mapValuesFromCodelist(
        listId: String,
        values: List<String>
    ): List<KeyValue> {
        return values.map {
            val itemId = codelistHandler.getCodeListEntryId(listId, it, "de")
            KeyValue(itemId, it)
        }
    }

    // TODO: should be mapped from a special codelist which only allows certain versions (this is for IGE-NG)
    protected fun addOGCtoVersions(versions: List<String>): List<KeyValue> {
        return versions
            .map { version -> KeyValue(null, "OGC:WCS $version") }
    }

    protected fun getOnlineResources(doc: Document?, xPath: String?): List<UrlBean> {
        val urls = mutableListOf<UrlBean>()
        val orNodes = xPathUtils.getNodeList(doc, xPath)
        if (orNodes != null) {
            for (i in 0 until orNodes.length) {
                val url = UrlBean()
                val link = xPathUtils.getString(orNodes.item(i), "@xlink:href")

                // do not add link if there's none (#781)
                if (link == null || link.trim() == "") continue

                url.url = link
                url.type = KeyValue(null, "Informationen im Internet")
                url.title = link

                urls.add(url)
            }
        }
        return urls
    }

    /**
     * @param doc
     * @param xPathExtCap, the path to the extended capabilities element
     * @return
     */
    protected fun getResourceLocators(doc: Document, xPathExtCap: String): List<UrlBean> {
        val locators = mutableListOf<UrlBean>()
        val url = xPathUtils.getNodeList(doc, "$xPathExtCap/inspire_common:ResourceLocator/inspire_common:URL")
        if (url != null) {
            for (i in 0 until url.length) {
                val urlBean = UrlBean()
                val type = xPathUtils.getString(doc, xPathExtCap + "/inspire_common:ResourceType[" + (i + 1) + "]")
                urlBean.url = url.item(i).textContent
                if (type != null) {
                    urlBean.type = getRelationType(type)
                } else {
                    // use previously used type!
                    if (i > 0) {
                        urlBean.type = locators[i - 1].type
                    }
                }
                locators.add(urlBean)
            }
        }
        return locators
    }

    /**
     * @param type
     * @return
     */
    private fun getRelationType(type: String): KeyValue {
        val entryId = if ("service" == type) "5066" else "9999" // Link to Service
        val value = codelistHandler.getCodelistValue("2000", entryId)
        return KeyValue(entryId, value)
    }

    /**
     * @param bean
     * @param doc
     * @param xpathExtCap
     */
    protected fun addExtendedCapabilities(bean: CapabilitiesBean, doc: Document, xpathExtCap: String) {
        if (xPathUtils.nodeExists(doc, xpathExtCap)) {
            // Resource Locator / Type
            bean.resourceLocators = getResourceLocators(doc, xpathExtCap)
            // Spatial Data Type
            // overwrite service type if defined here
            val type = xPathUtils.getString(doc, "$xpathExtCap/inspire_common:SpatialDataServiceType")
            if (type != null) {
                val mappedType = mapServiceTypeToKey(type)
                if (mappedType != null) {
                    bean.dataServiceType = mappedType
                } else {
                    log.warn("ServiceType could not be identified from ISO-value: $type")
                }
            }

            // add Temporal References if available
            mapToTimeReferenceBean(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:DateOfCreation"
            )?.let { bean.timeReference.add(it) }
            mapToTimeReferenceBean(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:DateOfPublication"
            )?.let { bean.timeReference.add(it) }
            mapToTimeReferenceBean(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:DateOfLastRevision"
            )?.let { bean.timeReference.add(it) }

            // add Timespan if available
            val startDate = xPathUtils.getString(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:TemporalExtent/inspire_common:IntervalOfDates/inspire_common:StartingDate"
            )
            val endDate = xPathUtils.getString(
                doc,
                "$xpathExtCap/inspire_common:TemporalReference/inspire_common:TemporalExtent/inspire_common:IntervalOfDates/inspire_common:EndDate"
            )
            if (startDate != null || endDate != null) {
                bean.timeSpan = TimeReferenceBean().apply {
                    getSimpleDate(startDate)?.let { from = it }
                    getSimpleDate(endDate)?.let { to = it }
                }
            }

            // Extended - Keywords
            val extKeywords =
                xPathUtils.getStringArray(doc, "$xpathExtCap/inspire_common:Keyword/inspire_common:KeywordValue")
            bean.keywords.addAll(extKeywords.toList())

            // Conformity
            bean.conformities = mapToConformityBeans(doc, "$xpathExtCap/inspire_common:Conformity")
        }
    }

    protected fun getKeyValueForPath(doc: Document, xpath: String, codelistId: String): KeyValue? {
        val value = xPathUtils.getString(doc, xpath)
        if (value.isNullOrEmpty()) return null
        var entryId = codelistHandler.getCodeListEntryId(codelistId, value, "de")
        if (entryId == null) {
            // use constraints can contain additional link information
            val endIndex = value.indexOf("(")
            if (endIndex != -1) {
                val valueWithoutLink = value.substring(0, endIndex).trim()
                entryId = codelistHandler.getCodeListEntryId(codelistId, valueWithoutLink, "de")
            }
        }
        return KeyValue(entryId, value)
    }

    protected fun getSpatialReferenceSystems(
        doc: Node,
        xpathDefault: String,
        xpathOther: String? = null
    ): List<KeyValue> {
        val result = mutableListOf<KeyValue>()
        val crs = xPathUtils.getStringArray(doc, xpathDefault)
        val crsAll = if (xpathOther != null) {
            val crsOther = xPathUtils.getStringArray(doc, xpathOther)
            ArrayUtils.addAll(crs, *crsOther) as Array<String>
        } else {
            crs
        }
        val uniqueCrs: MutableList<String?> = ArrayList()

        // check codelists for matching entryIds
        for (item in crsAll) {
            val itemId: String? = try {
                val splittedItem = item.split(":".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                splittedItem[splittedItem.size - 1]
            } catch (e: NumberFormatException) {
                // also detect crs like: http://www.opengis.net/def/crs/[epsg|ogc]/0/{code} (REDMINE-2108)
                val splittedItem = item.split("/".toRegex()).dropLastWhile { it.isEmpty() }.toTypedArray()
                splittedItem[splittedItem.size - 1]
            }
            val value: String? = codelistHandler.getCodelistValue("100", itemId.toString());
            val srsBean = if (value.isNullOrEmpty()) {
                KeyValue(null, item)
            } else {
                KeyValue(itemId, value)
            }
            if (!uniqueCrs.contains(srsBean.value)) {
                result.add(srsBean)
                uniqueCrs.add(srsBean.value)
            }
        }
        return result
    }


    /**
     * @param type
     * @return
     */
    private fun mapServiceTypeToKey(type: String): String? {
        return codelistHandler.getCodelists(listOf("5100"))[0].entries
            .find { it.getField("iso") == type }
            ?.id
    }

    /**
     * Search for an existing address by equal firstname, lastname and email OR institution and email.
     * @param address
     */
    protected fun searchForAddress(researchService: ResearchService, catalogId: String, address: AddressBean) {
        address._state = "W"
        val emailCondition =
            "EXISTS (SELECT 1 FROM jsonb_array_elements(document1.data -> 'contact') AS elem WHERE elem @> '{\"connection\": \"${address.email}\"}')"
        val conditionPerson = mutableListOf(
            if (address.firstName == null) "document1.data ->> 'firstName' = null" else "document1.data ->> 'firstName' = '${address.firstName}'",
            if (address.lastName == null) "document1.data ->> 'lastName' = null" else "document1.data ->> 'lastName' = '${address.lastName}'",
            emailCondition,
        )
        val conditionOrganisation = mutableListOf(
            "document1.data ->> 'organization' = '${address.organization}'",
            emailCondition,
        )
        val personFilter = BoolFilter("AND", conditionPerson, null, null, false)
        val organizationFilter = BoolFilter("AND", conditionOrganisation, null, null, false)
        val documentFilter = BoolFilter("OR", null, listOf(personFilter, organizationFilter), null, false)
        researchService.query(
            catalogId,
            ResearchQuery(null, documentFilter)
        ).hits.getOrNull(0)?.let {
            address.uuid = it._uuid
            address.type = it._type
            address._state = it._state
            address.exists = true
        }
    }

    protected fun checkForCoupledResource(
        researchService: ResearchService,
        catalogId: String,
        id: String
    ): GeoDataset? {
        val conditions = mutableListOf("document1.data ->> 'identifier' = '$id'", "deleted = 0")
        val documentFilter = BoolFilter("AND", conditions, null, null, false)
        val coupledResourceQuery = ResearchQuery(null, documentFilter)
        val hit = researchService.query(
            catalogId,
            coupledResourceQuery
        ).hits.getOrNull(0)
        if (hit != null) {
            return GeoDataset().apply {
                objectIdentifier = id
                objectClass = hit._type
                uuid = hit._uuid
                title = hit.title
                exists = true
            }
        } else {
            // if no dataset was found then try another search if a namespace exists in the id
            // In this case remove the namespace search again (INGRID34-6)
            val separatorPos = id.indexOf('#');
            if (separatorPos != -1) {
                return checkForCoupledResource(researchService, catalogId, id.substring(separatorPos + 1));
            }
        }

        return null;
    }

    protected fun getKeyValue(codelistId: String, value: String?, valueField: String = "de"): KeyValue? {
        if (value == null) return null
        
        if (codelistId == "6200" && value.lowercase() == "de") {
            val id = codelistHandler.getCodeListEntryId(codelistId, "Deutschland", "de")
            return KeyValue(id, null)
        }
        
        var id = codelistHandler.getCodeListEntryId(codelistId, value, valueField)
        if (id == null && valueField == "de") {
            id = codelistHandler.getCodeListEntryId(codelistId, value, "en")
        }
        return KeyValue(id, value)
    }

    companion object {

        /** ID of syslist entry "HTTPGet" in Syslist 5180  */
        @JvmStatic
        val ID_OP_PLATFORM_HTTP_GET = 7

        /** ID of syslist entry "HTTPPost" in Syslist 5180  */
        @JvmStatic
        val ID_OP_PLATFORM_HTTP_POST = 8
    }
}