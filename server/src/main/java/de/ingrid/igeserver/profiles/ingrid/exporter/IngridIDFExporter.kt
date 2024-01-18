/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service


@Service
class IngridIDFExporter(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService,
) : IgeExporter {

    val log = logger()

    var profileTransformer: IngridProfileTransformer? = null


    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridIDF",
        "Ingrid IDF",
        "Export von Ingrid Dokumenten IDF Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("ingrid"),
        false
    )

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val output: TemplateOutput = XMLStringOutput()
        if (doc.type == "FOLDER") return ""
        
        templateEngine.render(getTemplateForDoctype(doc.type), getMapFromObject(doc, catalogId), output)
        // pretty printing takes around 5ms
        // TODO: prettyFormat turns encoded new lines back to real ones which leads to an error when in a description
        //       are new lines for example
        val prettyXml = output.toString() // prettyFormat(output.toString(), 4)
        log.debug(prettyXml)
        return prettyXml
    }


    private fun getTemplateForDoctype(type: String): String {
        return when (type) {
            "InGridSpecialisedTask" -> "ingrid/idf-specialisedTask.jte"
            "InGridGeoDataset" -> "ingrid/idf-geodataset.jte"
            "InGridPublication" -> "ingrid/idf-literature.jte"
            "InGridGeoService" -> "ingrid/idf-geoservice.jte"
            "InGridProject" -> "ingrid/idf-project.jte"
            "InGridDataCollection" -> "ingrid/idf-dataCollection.jte"
            "InGridInformationSystem" -> "ingrid/idf-informationSystem.jte"
            "InGridOrganisationDoc" -> "ingrid/idf-address.jte"
            "InGridPersonDoc" -> "ingrid/idf-address.jte"
            else -> {
                throw ServerException.withReason("Cannot get template for type: $type")
            }
        }
    }

    private val mapper = ObjectMapper().registerKotlinModule()

    private fun getModelTransformer(json: Document, catalogId: String): Any {
        var ingridModel: IngridModel? = null
        var addressModel: AddressModel? = null
        try {
            ingridModel = mapper.convertValue(json, IngridModel::class.java)
        } catch (e: Exception) {
            addressModel = mapper.convertValue(json, AddressModel::class.java)
        }
        val isAddress = addressModel != null

        val codelistTransformer = CodelistTransformer(codelistHandler, catalogId)

        val transformers = mapOf(
            "InGridSpecialisedTask" to IngridModelTransformer::class,
            "InGridGeoDataset" to GeodatasetModelTransformer::class,
            "InGridPublication" to LiteratureModelTransformer::class,
            "InGridGeoService" to GeodataserviceModelTransformer::class,
            "InGridProject" to ProjectModelTransformer::class,
            "InGridDataCollection" to DataCollectionModelTransformer::class,
            "InGridInformationSystem" to InformationSystemModelTransformer::class,
            "InGridOrganisationDoc" to AddressModelTransformer::class,
            "InGridPersonDoc" to AddressModelTransformer::class
        )
        
        val transformerClass = profileTransformer?.get(ingridModel?.type ?: addressModel?.docType ?: "?") ?: transformers[ingridModel?.type ?: addressModel?.docType] ?: throw ServerException.withReason("Cannot get transformer for type: ${ingridModel?.type ?: addressModel?.docType}")
        return if(isAddress)
            transformerClass.constructors.first().call(ingridModel ?: addressModel, catalogId, codelistTransformer, null, json, documentService)
        else
            transformerClass.constructors.first().call(ingridModel ?: addressModel, catalogId, codelistTransformer, config, catalogService, TransformerCache(), json, documentService)
    }

    private fun getMapFromObject(json: Document, catalogId: String): Map<String, Any> {
        val modelTransformer = getModelTransformer(json, catalogId)
        return mapOf(
            "map" to mapOf(
                "model" to modelTransformer
            ),
        )

    }
}

private class XMLStringOutput : StringOutput() {
    override fun writeUserContent(value: String?) {
        if (value == null) return
        super.writeUserContent(
            StringEscapeUtils.escapeXml10(value)
//                .replace("\n", "&#10;")
//                .replace("\r", "&#13;")
//                .replace("\t", "&#9;")
        )
    }
}

data class DocInfo(val catalogId: String, val uuid: String, val externalUrl: String)
