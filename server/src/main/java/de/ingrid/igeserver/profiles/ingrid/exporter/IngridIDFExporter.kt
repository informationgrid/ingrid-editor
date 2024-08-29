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
import kotlin.reflect.KClass

@Service
class IngridIDFExporter(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService,
) : IgeExporter {

    val log = logger()

    protected val mapper = ObjectMapper().registerKotlinModule()

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridIDF",
        "Ingrid IDF",
        "Export von Ingrid Dokumenten IDF Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("ingrid"),
        false,
    )

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val output: TemplateOutput = XMLStringOutput()
        if (doc.type == "FOLDER") return ""

        templateEngine.render(
            getTemplateForDoctype(doc.type),
            getMapFromObject(doc, catalogId, options),
            output,
        )
        // pretty printing takes around 5ms
        // TODO: prettyFormat turns encoded new lines back to real ones which leads to an error when in a description
        //       are new lines for example
        val prettyXml = output.toString() // prettyFormat(output.toString(), 4)
        log.debug(prettyXml)
        return prettyXml
    }

    private fun getTemplateForDoctype(type: String): String {
        return when (type) {
            "InGridSpecialisedTask" -> "export/ingrid/idf/idf-specialisedTask.jte"
            "InGridGeoDataset" -> "export/ingrid/idf/idf-geodataset.jte"
            "InGridPublication" -> "export/ingrid/idf/idf-publication.jte"
            "InGridGeoService" -> "export/ingrid/idf/idf-geoservice.jte"
            "InGridProject" -> "export/ingrid/idf/idf-project.jte"
            "InGridDataCollection" -> "export/ingrid/idf/idf-dataCollection.jte"
            "InGridInformationSystem" -> "export/ingrid/idf/idf-informationSystem.jte"
            "InGridOrganisationDoc" -> "export/ingrid/idf/idf-address.jte"
            "InGridPersonDoc" -> "export/ingrid/idf/idf-address.jte"
            else -> {
                throw ServerException.withReason("Cannot get template for type: $type")
            }
        }
    }

    private fun getModelTransformer(json: Document, catalogId: String, exportOptions: ExportOptions): Any {
        val isAddress = json.type == "InGridOrganisationDoc" || json.type == "InGridPersonDoc"

        val codelistTransformer = CodelistTransformer(codelistHandler, catalogId)

        val transformerClass = getModelTransformerClass(json.type)
            ?: throw ServerException.withReason("Cannot get transformer for type: ${json.type}")

        return if (isAddress) {
            transformerClass.constructors.first().call(catalogId, codelistTransformer, null, json, documentService, config)
        } else {
            transformerClass.constructors.first().call(
                TransformerConfig(
                    getIngridModel(json, catalogId),
                    catalogId,
                    codelistTransformer,
                    config,
                    catalogService,
                    TransformerCache(),
                    json,
                    documentService,
                    exportOptions.tags,
                ),
            )
        }
    }

    fun getIngridModel(doc: Document, catalogId: String): IngridModel = mapper.convertValue(doc, IngridModel::class.java)

    fun getModelTransformerClass(docType: String): KClass<out Any>? {
        return when (docType) {
            "InGridSpecialisedTask" -> IngridModelTransformer::class
            "InGridGeoDataset" -> GeodatasetModelTransformer::class
            "InGridPublication" -> PublicationModelTransformer::class
            "InGridGeoService" -> GeodataserviceModelTransformer::class
            "InGridProject" -> ProjectModelTransformer::class
            "InGridDataCollection" -> DataCollectionModelTransformer::class
            "InGridInformationSystem" -> InformationSystemModelTransformer::class
            "InGridOrganisationDoc" -> AddressModelTransformer::class
            "InGridPersonDoc" -> AddressModelTransformer::class
            else -> null
        }
    }

    private fun getMapFromObject(json: Document, catalogId: String, options: ExportOptions): Map<String, Any> {
        val modelTransformer = getModelTransformer(json, catalogId, options)
        return mapOf(
            "map" to mapOf(
                "model" to modelTransformer,
            ),
        )
    }
}

private class XMLStringOutput : StringOutput() {
    override fun writeUserContent(value: String?) {
        if (value == null) return
        super.writeUserContent(
            StringEscapeUtils.escapeXml10(value),
//                .replace("\n", "&#10;")
//                .replace("\r", "&#13;")
//                .replace("\t", "&#9;")
        )
    }
}
