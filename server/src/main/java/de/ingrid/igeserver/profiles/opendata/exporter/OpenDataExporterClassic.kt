/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.exports.output.JsonStringOutput
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.UploadConfig
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.commons.text.StringEscapeUtils
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.context.annotation.Lazy
import org.springframework.http.MediaType
import org.springframework.stereotype.Service
import tools.jackson.databind.JsonNode
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

@Service
class OpenDataExporterClassic(
    @Qualifier("ingridIDFExporter") val idfExporter: IngridIDFExporter,
    val ingridIndexExporter: IngridIndexExporter,
    val codelistHandler: CodelistHandler,
    val uploadConfig: UploadConfig,
    @Lazy val documentService: DocumentService,
) : IgeExporter {

    val log = logger()

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                DocumentCategory.DATA,
                "indexOpenDataIDFClassic",
                "Open-Data Index (Classic)",
                "Export der Datensätze für die weitere Verwendung im InGrid-System < v8.3.0",
                MediaType.APPLICATION_JSON_VALUE,
                "json",
                listOf("opendata"),
            )
        }

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val mapper = jacksonObjectMapper()
        if (doc.type == "FOLDER") {
            val luceneDoc = ingridIndexExporter.run(doc, catalogId, options) as String
            val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)
            return luceneJson.toPrettyString()
        }

        // modify doc type and other fields to be mapped correctly during InGrid export
        val modifiedDoc = addDefaultValues(doc)

        val luceneDoc = ingridIndexExporter.run(modifiedDoc, catalogId, options) as String

        val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)

        val additionalIdf = createAdditionalIdf(modifiedDoc, catalogId)
        appendToIdf(luceneJson, additionalIdf)

        val additionalLuceneJson = getAdditionalLuceneJsonForDCATExporter(doc, catalogId)
        // apply all bmi fields to ingrid lucene document
        additionalLuceneJson.properties().forEach { (field, value) ->
            if (luceneJson.has(field)) log.error("Conflict between BMI export document and InGrid on field: $field")
            luceneJson.set(field, value)
        }

        // TODO: support fingerprint in this profile for additionalIDF
        /*
                if (doc.type != "FOLDER") {
                    val idfFingerprintChecked = handleFingerprint(catalogId, doc.uuid, idf)
                    luceneJson.put("idf", idfFingerprintChecked)
                }
         */

        return luceneJson.toPrettyString()
    }

    private fun getAdditionalLuceneJsonForDCATExporter(doc: Document, catalogId: String): JsonNode {
        val output: TemplateOutput = JsonStringOutput()
        templateEngine.render("export/opendata/lucene-export-classic.jte", getMapFromObject(doc, catalogId), output)

        return jacksonObjectMapper().readValue(output.toString(), JsonNode::class.java)
    }

    private fun getMapFromObject(json: Document, catalogId: String): Map<String, Any> = mapOf(
        "map" to mapOf(
            "model" to OpenDataModelTransformerAdditional(
                json,
                codelistHandler,
                catalogId,
                uploadConfig,
                documentService,
            ),
            "catalogId" to catalogId,
        ),
    )

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
                        uploadConfig,
                        documentService,
                    ),
                ),
            ),
            output,
        )
        return output.toString()
    }

    private fun addDefaultValues(doc: Document): Document {
        val mapper = jacksonObjectMapper()
        return doc.apply {
            type = "InGridSpecialisedTask"
            data.apply {
                val outer = this

                set("pointOfContact", get("addresses"))
                put("alternateTitle", getString("landingPage"))
                set("openDataCategories", get("openDataCategories"))
                set(
                    "spatial",
                    mapper.createObjectNode().apply {
                        set(
                            "references",
                            if (outer.get("spatial") == null || outer.get("spatial").isEmpty) {
                                mapper.createArrayNode()
                            } else {
                                outer.get(
                                    "spatial",
                                )
                            },
                        )
                        set("spatialSystems", null)
                    },
                )
                get("keywords")?.let {
                    set(
                        "keywords",
                        mapper.createObjectNode().apply {
                            set(
                                "free",
                                mapper.createArrayNode().apply {
                                    it.values().forEach {
                                        add(
                                            mapper.createObjectNode().apply {
                                                put("id", null as String?)
                                                put("label", it.asString())
                                            },
                                        )
                                    }
                                },
                            )
                        },
                    )
                }
                set(
                    "metadata",
                    mapper.createObjectNode().apply {
                        set(
                            "language",
                            mapper.createObjectNode().apply {
                                put("key", 150)
                            },
                        )
                    },
                )
                put("isOpenData", true)
                set("openDataCategories", get("DCATThemes"))
                set(
                    "resource",
                    mapper.createObjectNode().apply {
                        put("purpose", outer.getString("legalBasis"))
                        put("specificUsage", outer.getString("specificUsage"))
                    },
                )
                set(
                    "temporal",
                    mapper.createObjectNode().apply {
                        set("resourceDateType", outer.getPath("temporal.rangeType"))
                        set("resourceDate", outer.getPath("temporal.timeSpanDate"))
                        set("resourceRange", outer.getPath("temporal.timeSpanRange"))
                    },
                )
                set(
                    "maintenanceInformation",
                    mapper.createObjectNode().apply {
                        set("maintenanceAndUpdateFrequency", outer.get("periodicity"))
                    },
                )
            }
        }
    }

    private class XMLStringOutput : StringOutput() {
        override fun writeUserContent(value: String?) {
            if (value == null) return
            super.writeUserContent(
                StringEscapeUtils.escapeXml10(value),
            )
        }
    }
}
