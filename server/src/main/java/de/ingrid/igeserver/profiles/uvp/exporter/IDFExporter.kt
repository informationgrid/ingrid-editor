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
            "UvpApprovalProcedureDoc" -> "export/uvp/idf/idf-approval.jte"
            "UvpNegativePreliminaryAssessmentDoc" -> "export/uvp/idf/idf-negative.jte"
            "UvpForeignProjectDoc" -> "export/uvp/idf/idf-foreign.jte"
            "UvpSpatialPlanningProcedureDoc" -> "export/uvp/idf/idf-spatialOrLine.jte"
            "UvpLineDeterminationDoc" -> "export/uvp/idf/idf-spatialOrLine.jte"
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
