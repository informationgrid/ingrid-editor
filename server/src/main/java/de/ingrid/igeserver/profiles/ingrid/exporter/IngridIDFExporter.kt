package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service


@Service
@Profile("ingrid")
class IngridIDFExporter @Autowired constructor(
    val codelistHandler: CodelistHandler,
    val config: Config,
    val catalogService: CatalogService,
) : IgeExporter {

    val log = logger()

    val codelistTransformer = CodelistTransformer(codelistHandler)


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
            "InGridLiterature" -> "ingrid/idf-literature.jte"
            "InGridGeoService" -> "ingrid/idf-geoservice.jte"
            "InGridProject" -> "ingrid/idf-project.jte"
            "InGridDataCollection" -> "ingrid/idf-dataCollection.jte"
            "InGridInformationSystem" -> "ingrid/idf-informationSystem.jte"
            else -> {
                throw ServerException.withReason("Cannot get template for type: $type")
            }
        }
    }

    private val mapper = ObjectMapper().registerKotlinModule()

    private fun getModelTransformer(json: Document, catalogId: String): IngridModelTransformer {
        val ingridModel = mapper.convertValue(json, IngridModel::class.java)

        val transformers = mapOf(
            "InGridSpecialisedTask" to IngridModelTransformer::class,
            "InGridGeoDataset" to GeodatasetModelTransformer::class,
            "InGridLiterature" to IngridModelTransformer::class,
            "InGridGeoService" to GeodataserviceModelTransformer::class,
            "InGridProject" to IngridModelTransformer::class,
            "InGridDataCollection" to IngridModelTransformer::class,
            "InGridInformationSystem" to IngridModelTransformer::class
        )
        val transformerClass = transformers[ingridModel.type] ?: throw ServerException.withReason("Cannot get transformer for type: ${ingridModel.type}")
        return transformerClass.constructors.first().call(ingridModel, catalogId, codelistTransformer, config, catalogService)
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
