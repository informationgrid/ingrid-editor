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
import de.ingrid.igeserver.services.CodelistHandler
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import gg.jte.output.StringOutput
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.unbescape.json.JsonEscape

@Service
@Profile("ingrid")
class ISOImport(val codelistService: CodelistHandler) : IgeImporter {
    private val log = logger()

    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)

    override fun run(data: Any): JsonNode {

        /*val xmlDeserializer = XmlMapper.builder()
            .defaultUseWrapper(false)
            .nameForTextElement("innerText")
            .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)
            .build()
            .registerKotlinModule()*/

        val xmlDeserializer = XmlMapper(JacksonXmlModule().apply {
            setDefaultUseWrapper(false)
            setXMLTextElementName("innerText")
        }).registerKotlinModule()
            .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)


        val finalObject = xmlDeserializer.readValue(data as String, Metadata::class.java)
        val output = createISO(finalObject)

        return jacksonObjectMapper().readValue(output, JsonNode::class.java)


        // input is XML
//        val context = JAXBContext.newInstance(Metadata::class.java)
//        val unmarshaller = context.createUnmarshaller()
//        val reader = StringReader(data as String)
//        val md = unmarshaller.unmarshal(reader) as Metadata
//        return mapToJson(md)
    }
    
    fun createISO(data: Metadata): String {
        val output: TemplateOutput = JsonStringOutput()

        when (val hierarchyLevel = data.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
            "service" -> {
                val model = GeoserviceMapper(data, codelistService)
                templateEngine.render("ingrid/geoservice.jte", model, output)
            }

            "dataset" -> {
                val model = GeodatasetMapper(data, codelistService)
                templateEngine.render("ingrid/geodataset.jte", model, output)
            }

            else -> throw ServerException.withReason("Not supported hierarchy level for import: $hierarchyLevel")
        }
        return output.toString()
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        return "application/xml" == contentType
    }

    private class JsonStringOutput : StringOutput() {
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