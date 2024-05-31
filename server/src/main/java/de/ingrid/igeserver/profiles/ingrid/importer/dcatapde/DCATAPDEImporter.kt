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
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapde

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.model.RecordPLUProperties
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
class DCATAPDEImporter(
    val codelistService: CodelistHandler,
    @Lazy val catalogService: CatalogService,
    @Lazy val documentService: DocumentService,
    val rdfDeserializer: RdfDeserializer
) : IgeImporter {
    private val log = logger()

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override fun run(catalogId: String, data: Any): JsonNode {

        val deserializeRecord = rdfDeserializer.deserializeRecord(data as String)
            ?: throw ServerException.withReason("DCAT-AP.DE record could not be deserialized")

        val output = try {
            convertDcatRecordToJson(catalogId, deserializeRecord)
        } catch (ex: Exception) {
            throw ServerException.withReason("${ex.message} -> ${ex.cause?.toString()}")
        }

         log.debug("Created JSON from imported file: $output")

        return jacksonObjectMapper().readValue(output, JsonNode::class.java)
    }

    fun convertDcatRecordToJson(catalogId: String, record: RecordPLUProperties): String {
        val output: TemplateOutput = JsonStringOutput()

        templateEngine.render("imports/ingrid/dcatap/dcat-ap-de-1_0.jte", mapOf(
            "model" to DcatApDeMapper(catalogId, record, documentService)
        ), output)
        return output.toString()
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        return (contentType == "application/xml" || contentType == "application/rdf+xml") && fileContent.contains("<rdf:RDF") && fileContent.contains("http://dcat-ap.de/def/dcatde/")
    }

    internal class JsonStringOutput : StringOutput() {
        override fun writeUserContent(value: String?) {
            if (value == null) return
            super.writeUserContent(
                JsonEscape.escapeJson(value)
            )
        }
    }

    override val typeInfo: ImportTypeInfo
        get() = ImportTypeInfo(
            "dcat-ap-de-1.0",
            "DCAT-AP.DE 1.0",
            "",
            emptyList()
        )
}
