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
package de.ingrid.igeserver.profiles.opendata.exporter

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.Config
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class OpenDataExporter(
    @Qualifier("ingridIDFExporter") val idfExporter: IngridIDFExporter,
    val ingridIndexExporter: IngridIndexExporter,
    val codelistHandler: CodelistHandler,
    val uploadConfig: Config
) : IgeExporter {

    val log = logger()

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                DocumentCategory.DATA,
                "indexOpenDataIDF",
                "Open-Data Index",
                "Export der Datensätze für die weitere Verwendung im Exporter.",
                MediaType.APPLICATION_JSON_VALUE,
                "json",
                listOf("opendata")
            )
        }


    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        /*val bmiExport = super.run(doc, catalogId, options) as String

        val ingridDoc = convertBmiToIngridDoc(doc)
        val ingridExport = ingridIndexExporter.run(ingridDoc, catalogId, options) as String

        val mapper = jacksonObjectMapper()
        val bmiJson = mapper.readValue(bmiExport, JsonNode::class.java)
        val luceneJson = mapper.readValue(ingridExport, ObjectNode::class.java)

        val additionalIdf = createAdditionalIdf(doc, catalogId)
        appendToIdf(luceneJson, additionalIdf)
        println(additionalIdf)

        // apply all bmi fields to ingrid lucene document
        bmiJson.fieldNames().forEach {
            if (luceneJson.has(it)) log.error("Conflict between BMI export document and InGrid on field: $it")
            luceneJson.set<JsonNode>(it, bmiJson.get(it))
        }

        return luceneJson.toPrettyString()*/

        // modify doc type to be mapped correctly during InGrid export
        doc.type = "InGridSpecialisedTask"
        doc.data.put("isOpenData", true)
        val luceneDoc = ingridIndexExporter.run(doc, catalogId, options) as String

        val mapper = jacksonObjectMapper()
        val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)

        val additionalIdf = createAdditionalIdf(doc, catalogId)
        appendToIdf(luceneJson, additionalIdf)

        // TODO: support fingerprint in this profile for additionalIDF
/*
        if (doc.type != "FOLDER") {
            val idfFingerprintChecked = handleFingerprint(catalogId, doc.uuid, idf)
            luceneJson.put("idf", idfFingerprintChecked)
        }
*/

        return luceneJson.toPrettyString()
    }

    private fun appendToIdf(json: ObjectNode?, additionalIdf: String) {
        val updatedIdf = json?.getString("idf")?.replace("</idf:idfMdMetadata>", "$additionalIdf</idf:idfMdMetadata>")
        json?.put("idf", updatedIdf)
    }

    private fun createAdditionalIdf(doc: Document, catalogId: String): String {
        val output: TemplateOutput = XMLStringOutput()
        templateEngine.render(
            "export/opendata/additional.jte",
            mapOf(
                "map" to mapOf(
                    "model" to OpenDataModelTransformerAdditional(
                        doc,
                        codelistHandler,
                        catalogId,
                        uploadConfig
                    )
                )
            ),
            output
        )
        return output.toString()
    }

    private fun convertBmiToIngridDoc(doc: Document): Document {
        val mapper = jacksonObjectMapper()
        return doc.apply {
            type = "InGridSpecialisedTask"
            data.apply {
                val outer = this
                set<JsonNode>("pointOfContact", get("addresses").apply {
                    (get(0)?.get("type") as ObjectNode?)?.put("key", 12)
                })
                put("alternateTitle", getString("landingPage"))
                set<JsonNode>("openDataCategories", get("openDataCategories"))
                set<JsonNode>("spatial", mapper.createObjectNode().apply {
                    set<JsonNode>("references", outer.get("spatial"))
                    set<JsonNode>("spatialSystems", null)
                })
                val tempKeywords = get("keywords")
                set<JsonNode>("keywords", mapper.createObjectNode().apply {
                    set<JsonNode>("free", mapper.createArrayNode().apply {
                        tempKeywords.forEach {
                            add(mapper.createObjectNode().apply {
                                put("id", null as String?)
                                put("label", it.asText())
                            })
                        }

                    })
                })
                set<JsonNode>("metadata", mapper.createObjectNode().apply {
                    set<JsonNode>("language", mapper.createObjectNode().apply {
                        put("key", 150)
                    })
                })
                put("isOpenData", true)
                set<JsonNode>("openDataCategories", get("DCATThemes"))
                set<JsonNode>("resource", mapper.createObjectNode().apply {
                    put("purpose", outer.getString("legalBasis"))
                    put("specificUsage", outer.getString("specificUsage"))
                })
                set<JsonNode>("temporal", mapper.createObjectNode().apply {
                    set<JsonNode>("resourceDateType", outer.getPath("temporal.rangeType"))
                    set<JsonNode>("resourceDate", outer.getPath("temporal.timeSpanDate"))
                    set<JsonNode>("resourceRange", outer.getPath("temporal.timeSpanRange"))
                })
                set<JsonNode>("maintenanceInformation", mapper.createObjectNode().apply {
                    set<JsonNode>("maintenanceAndUpdateFrequency", outer.get("periodicity"))
                })
            }
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
}
