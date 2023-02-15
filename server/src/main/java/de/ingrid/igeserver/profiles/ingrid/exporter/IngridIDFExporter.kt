package de.ingrid.igeserver.profiles.ingrid.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.codelists.CodeListService
import de.ingrid.igeserver.ServerException
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


    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridIDF",
        "Ingrid IDF",
        "Export von Ingrid Dokumenten IDF Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("ingrid")
    )

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override fun run(doc: Document, catalogId: String): Any {
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

    private fun getMapFromObject(json: Document, catalogId: String): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        val modelTransformer = IngridModelTransformer(mapper.convertValue(json, IngridModel::class.java), catalogId, codelistHandler, config, catalogService)
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
