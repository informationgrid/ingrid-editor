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
package de.ingrid.igeserver.profiles.ingrid.importer

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
class ISOImport(val codelistService: CodelistHandler, @Lazy val catalogService: CatalogService) : IgeImporter {
    private val log = logger()

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)
    
    var profileMapper: MutableMap<String, ISOImportProfile> = mutableMapOf()

    override fun run(catalogId: String, data: Any): JsonNode {
        
        val xmlDeserializer = XmlMapper(JacksonXmlModule().apply {
            setDefaultUseWrapper(false)
            setXMLTextElementName("innerText")
        }).registerKotlinModule()
            .enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)


        val finalObject = xmlDeserializer.readValue(data as String, Metadata::class.java)
        val output = try {
            val catalogProfileId = catalogService.getProfileFromCatalog(catalogId).identifier
            convertIsoToJson(catalogId, finalObject, catalogProfileId)
        } catch (ex: Exception) {
            throw ServerException.withReason("${ex.message} -> ${ex.cause?.toString()}")
        }
        
        log.debug("Created JSON from imported file: $output")

        return jacksonObjectMapper().readValue(output, JsonNode::class.java)
    }
    
    fun convertIsoToJson(catalogId: String, data: Metadata, catalogProfileId: String): String {
        val output: TemplateOutput = JsonStringOutput()
        
        val profileOutput = handleByProfile(catalogId, data, catalogProfileId)
        if (profileOutput != null) return profileOutput

        when (val hierarchyLevel = data.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
            "service" -> {
                val model = GeoserviceMapper(data, codelistService, catalogId)
                templateEngine.render("imports/ingrid/geoservice.jte", mapOf("model" to model), output)
            }

            "dataset" -> {
                val model = GeodatasetMapper(data, codelistService, catalogId)
                templateEngine.render("imports/ingrid/geodataset.jte", mapOf("model" to model), output)
            }
            
            "series" -> {
                val model = GeodatasetMapper(data, codelistService, catalogId)
                templateEngine.render("imports/ingrid/geodataset.jte", mapOf("model" to model), output)
            }

            else -> throw ServerException.withReason("Not supported hierarchy level for import: $hierarchyLevel")
        }
        return output.toString()
    }

    private fun handleByProfile(catalogId: String, data: Metadata, profile: String): String? {
        return profileMapper[profile]?.let {
            it.handle(catalogId, data)?.let {
                val output: TemplateOutput = JsonStringOutput()
                templateEngine.render(it.template, it.mapper, output)
                output.toString()
            }
        }
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        return "application/xml" == contentType
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
            "iso",
            "ISO",
            "ISO Dokumente",
            emptyList()
        )
}