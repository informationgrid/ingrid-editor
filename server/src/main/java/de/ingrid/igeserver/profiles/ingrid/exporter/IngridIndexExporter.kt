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
package de.ingrid.igeserver.profiles.ingrid.exporter

import com.networknt.schema.InputFormat
import com.networknt.schema.SchemaRegistry
import com.networknt.schema.SchemaRegistryConfig
import com.networknt.schema.dialect.Dialects
import com.networknt.schema.path.PathType
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.xml.XMLUtils
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper

@Service
class IngridIndexExporter(
    @Qualifier("ingridIDFExporter") val idfExporter: IngridIDFExporter,
    @Qualifier("ingridLuceneExporter") val luceneExporter: IngridLuceneExporter,
) : IgeExporter {

    override fun exportSql(catalogId: String): String = "${super.exportSql(catalogId)} AND document.data ->> 'hideAddress' IS DISTINCT FROM 'true'"

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexInGridIDF",
        "Standard Export Portal (InGrid)",
        "Export von Ingrid Dokumenten ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format.",
        "application/json",
        "json",
        listOf("ingrid"),
        isPublic = true,
        useForPublish = true,
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        val luceneDoc = luceneExporter.run(doc, catalogId, options) as String

        val mapper = jacksonObjectMapper()
        val luceneJson = mapper.readValue(luceneDoc, ObjectNode::class.java)

        if (doc.type != "FOLDER") {
            val wrapper = idfExporter.documentWrapperRepository.findByCatalog_IdentifierAndUuid(catalogId, doc.uuid)
            val idf = idfExporter.run(doc, catalogId, options)
            val fingerprint = idfExporter.calculateFingerprint(idf)
            val previousFingerprintInfo = idfExporter.getPreviousFingerprint(wrapper, idfExporter.typeInfo)

            val dateStampDate = if (fingerprint != previousFingerprintInfo?.fingerprint) {
                // updates the fingerprint in the database
                idfExporter.updateDocumentFingerprint(wrapper, fingerprint, idfExporter.typeInfo)
            } else {
                previousFingerprintInfo.date
            }
            val docWithUpdatedTimestamp = idfExporter.updateDateStamp(idf, dateStampDate)
            val idfDoc = convertStringToDocument(docWithUpdatedTimestamp)
            luceneJson.set(
                "exports",
                jacksonObjectMapper().createObjectNode().apply {
                    put("iso", XMLUtils.toString(transformIDFtoIso(idfDoc!!)))
                },
            )
        }

        val result = luceneJson.toPrettyString()
        if (!options.skipValidation) validateSchema(result)
        return result
    }

    private fun validateSchema(json: String) {
        val schemaRegistry = SchemaRegistry.withDialect(Dialects.getDraft202012()) { builder ->
            builder.schemaIdResolvers { resolvers ->
                resolvers.mapPrefix("https://wemove.com/schemas/", "classpath:/")
            }
            builder.schemaRegistryConfig(
                SchemaRegistryConfig.builder().pathType(PathType.JSON_PATH).build(),
            )
            builder
                .nodeReader { reader -> reader.locationAware() }
                // Allow classpath and wemove schema prefix patterns through the library sandbox
                .schemaLoader { loader ->
                    loader.allow { iri ->
                        iri.toString().startsWith("classpath:") || iri.toString().startsWith("https://wemove.com/schemas/")
                    }
                }
        }

        val schema1 = schemaRegistry.getSchema("/templates/export/ingrid/schemes/index-ingrid.json")
        val assertions = schema1.validate(json, InputFormat.JSON)

        if (assertions.isNotEmpty()) {
            throw IllegalArgumentException("JSON schema validation failed: ${assertions.joinToString(", ")}")
        }
    }
}
