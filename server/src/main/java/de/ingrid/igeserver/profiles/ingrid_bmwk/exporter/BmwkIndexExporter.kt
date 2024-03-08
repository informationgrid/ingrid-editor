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
package de.ingrid.igeserver.profiles.ingrid_bmwk.exporter

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.bmi.exporter.BmiIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.services.DocumentCategory
import org.apache.logging.log4j.kotlin.logger
import org.springframework.http.MediaType
import org.springframework.stereotype.Service

@Service
class BmwkIndexExporter(val ingridIndexExporter: IngridIndexExporter) : BmiIndexExporter() {
    
    val log = logger()

    override val typeInfo: ExportTypeInfo
        get() {
            return ExportTypeInfo(
                DocumentCategory.DATA,
                "indexInGridIDFBmwk",
                "BMWK Index",
                "Export der Datensätze für die weitere Verwendung im Exporter.",
                MediaType.APPLICATION_JSON_VALUE,
                "json",
                listOf("ingrid-bmwk")
            )
        }


    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val bmiExport = super.run(doc, catalogId, options) as String

        val ingridDoc = convertBmiToIngridDoc(doc)
        val ingridExport = ingridIndexExporter.run(ingridDoc, catalogId, options) as String

        val mapper = jacksonObjectMapper()
        val bmiJson = mapper.readValue(bmiExport, JsonNode::class.java)
        val luceneJson = mapper.readValue(ingridExport, ObjectNode::class.java)

        // apply all bmi fields to ingrid lucene document
        bmiJson.fieldNames().forEach {
            if (luceneJson.has(it)) log.error("Conflict between BMI export document and InGrid on field: $it")
            luceneJson.set<JsonNode>(it, bmiJson.get(it))
        }

        return luceneJson.toPrettyString()
    }

    private fun convertBmiToIngridDoc(doc: Document): Document {
//        return Document().apply { 
//            type = "InGridSpecialisedTask"
//            id = doc.id
//            catalog = doc.catalog
//        }

        val mapper = jacksonObjectMapper()
        return doc.apply {
            type = "InGridSpecialisedTask"
            data.apply {
                val tempSpatial = get("spatial")
                set<JsonNode>("spatial", mapper.createObjectNode().apply {
                    set<JsonNode>("references", tempSpatial)
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

            }
        }
    }

    /*
    override fun toString(exportedObject: Any): String {
        return exportedObject.toString()
    }

    private fun getMapFromObject(json: Document, catalogId: String): Map<String, Any> {

        return mapOf(
            "model" to jacksonObjectMapper().convertValue(json, BmiModel::class.java),
            "catalogId" to catalogId
        )

    }*/
}
