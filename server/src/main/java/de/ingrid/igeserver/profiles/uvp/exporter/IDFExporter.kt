package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service


@Service
class IDFExporter(val config: Config) : IgeExporter {

    val log = logger()

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "uvpIDF",
        "UVP IDF",
        "Export von UVP Verfahren ins IDF Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("uvp")
    )

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        if (doc.type == "FOLDER") return ""
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
            "UvpApprovalProcedureDoc" -> "uvp/idf-approval.jte"
            "UvpNegativePreliminaryAssessmentDoc" -> "uvp/idf-negative.jte"
            "UvpForeignProjectDoc" -> "uvp/idf-foreign.jte"
            "UvpSpatialPlanningProcedureDoc" -> "uvp/idf-spatialOrLine.jte"
            "UvpLineDeterminationDoc" -> "uvp/idf-spatialOrLine.jte"
            else -> {
                throw ServerException.withReason("Cannot get template for type: $type")
            }
        }
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    private fun getMapFromObject(json: Document, catalogId: String): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        return mapOf(
            "map" to mapOf(
                "model" to mapper.convertValue(json, UVPModel::class.java).apply { init(catalogId) },
                "docInfo" to DocInfo(catalogId, json.uuid, config.uploadExternalUrl)
            )
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
