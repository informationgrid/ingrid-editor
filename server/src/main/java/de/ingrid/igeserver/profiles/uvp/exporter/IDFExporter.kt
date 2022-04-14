package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.uvp.exporter.model.ApprovalProcedureModel
import de.ingrid.igeserver.services.DocumentCategory
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("uvp")
class IDFExporter : IgeExporter {
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

    override fun run(doc: Document, catalogId: String): Any {
        val output: TemplateOutput = StringOutput()
        templateEngine.render(getTemplateForDoctype(doc.type), getMapFromObject(doc).get("model"), output)
        println(output)
        return output.toString()
    }

    private fun getTemplateForDoctype(type: String): String {
        return when (type) {
            "UvpApprovalProcedureDoc" -> "uvp/idf-approval.jte"
            "UvpNegativePreliminaryAssessmentDoc" -> "uvp/idf-negative.jte"
            else -> {
                throw ServerException.withReason("Cannot get template for type: $type")
            }
        }
    }

    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    private fun getMapFromObject(json: Document): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        return mapOf("model" to mapper.convertValue(json, ApprovalProcedureModel::class.java))

    }
}