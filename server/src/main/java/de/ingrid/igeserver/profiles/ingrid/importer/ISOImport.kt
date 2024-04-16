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
import de.ingrid.igeserver.services.DocumentService
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

data class IsoImportData(
    val data: Metadata, 
    val codelistService: CodelistHandler,
    val catalogId: String,
    val documentService: DocumentService,
    val addressMaps: MutableMap<String, String>
)

@Service
class ISOImport(val codelistService: CodelistHandler, @Lazy val catalogService: CatalogService, @Lazy val documentService: DocumentService) : IgeImporter {
    private val log = logger()

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)
    
    var profileMapper: MutableMap<String, ISOImportProfile> = mutableMapOf()

    override fun run(catalogId: String, data: Any, addressMaps: MutableMap<String, String>): JsonNode {
        
        val xmlDeserializer = XmlMapper(JacksonXmlModule().apply {
            setDefaultUseWrapper(false)
            setXMLTextElementName("innerText")
        }).registerKotlinModule()
            .enable(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES)
            .disable(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES)


        val finalObject = xmlDeserializer.readValue(data as String, Metadata::class.java)
        val isoData = IsoImportData(finalObject, codelistService, catalogId, documentService, addressMaps)
        val output = try {
            val catalogProfileId = catalogService.getProfileFromCatalog(catalogId).identifier
            convertIsoToJson(isoData, catalogProfileId)
        } catch (ex: Exception) {
            throw ServerException.withReason("${ex.message} -> ${ex.cause?.toString()}")
        }
        
        log.debug("Created JSON from imported file: $output")

        return jacksonObjectMapper().readValue(output, JsonNode::class.java)
    }
    
    fun convertIsoToJson(isoData: IsoImportData, catalogProfileId: String): String {
        val output: TemplateOutput = JsonStringOutput()
        
        val profileOutput = handleByProfile(isoData, catalogProfileId)
        if (profileOutput != null) return profileOutput

        when (val hierarchyLevel = isoData.data.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
            "service" -> {
                val model = GeoserviceMapper(isoData)
                templateEngine.render("imports/ingrid/geoservice.jte", mapOf("model" to model), output)
            }

            "dataset" -> {
                val model = GeodatasetMapper(isoData)
                templateEngine.render("imports/ingrid/geodataset.jte", mapOf("model" to model), output)
            }
            
            "series" -> {
                val model = GeodatasetMapper(isoData)
                templateEngine.render("imports/ingrid/geodataset.jte", mapOf("model" to model), output)
            }

            else -> throw ServerException.withReason("Not supported hierarchy level for import: $hierarchyLevel")
        }
        return output.toString()
    }

    private fun handleByProfile(isoData: IsoImportData, profile: String): String? {
        return profileMapper[profile]?.let {
            it.handle(isoData.catalogId, isoData.data, isoData.addressMaps)?.let {
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