package de.ingrid.igeserver.profiles.uvp.exporter

import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
import de.ingrid.igeserver.services.DocumentCategory
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import java.io.StringReader
import java.io.StringWriter
import javax.xml.XMLConstants
import javax.xml.transform.OutputKeys
import javax.xml.transform.Source
import javax.xml.transform.Transformer
import javax.xml.transform.TransformerFactory
import javax.xml.transform.stream.StreamResult
import javax.xml.transform.stream.StreamSource


@Service
@Profile("uvp")
class IDFExporter : IgeExporter {
    
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

    override fun run(doc: Document, catalogId: String): Any {
        val output: TemplateOutput = StringOutput()
        templateEngine.render(getTemplateForDoctype(doc.type), getMapFromObject(doc)["model"], output)
        // pretty printing takes around 5ms
        val prettyXml = prettyFormat(output.toString(), 4)
        log.debug(prettyXml)
        return prettyXml
    }

    fun prettyFormat(input: String, indent: Int): String {
        return try {
            val xmlInput: Source = StreamSource(StringReader(input))
            val stringWriter = StringWriter()
            val xmlOutput = StreamResult(stringWriter)
            val transformerFactory = TransformerFactory.newInstance()
            transformerFactory.setAttribute("indent-number", indent)
            transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_DTD, "")
            transformerFactory.setAttribute(XMLConstants.ACCESS_EXTERNAL_STYLESHEET, "")
            val transformer: Transformer =
                transformerFactory.newTransformer(StreamSource(javaClass.getResourceAsStream("/prettyprint.xsl")))
            transformer.setOutputProperty(OutputKeys.INDENT, "yes")
            transformer.transform(xmlInput, xmlOutput)
            xmlOutput.writer.toString()
        } catch (e: Exception) {
            throw RuntimeException(e) // simple exception handling, please review it
        }
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

    private fun getMapFromObject(json: Document): Map<String, Any> {

        val mapper = ObjectMapper().registerKotlinModule()
        return mapOf("model" to mapper.convertValue(json, UVPModel::class.java))

    }
}