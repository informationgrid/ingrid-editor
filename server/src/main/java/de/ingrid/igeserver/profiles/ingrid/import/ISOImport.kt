package de.ingrid.igeserver.profiles.ingrid.import

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.MapperFeature
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.dataformat.xml.JacksonXmlModule
import com.fasterxml.jackson.dataformat.xml.XmlMapper
import com.fasterxml.jackson.module.kotlin.registerKotlinModule
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import org.apache.logging.log4j.kotlin.logger
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class ISOImport : IgeImporter {
    private val log = logger()

    override fun run(data: Any): JsonNode {

        val xmlDeserializer = XmlMapper(JacksonXmlModule().apply {
            setDefaultUseWrapper(false)
            setXMLTextElementName("innerText")
        }).registerKotlinModule()
            .configure(MapperFeature.ACCEPT_CASE_INSENSITIVE_PROPERTIES, true)
            .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false)

        val finalObject = xmlDeserializer.readValue(data as String, Metadata::class.java)
        return mapToJson(finalObject)


        // input is XML
//        val context = JAXBContext.newInstance(Metadata::class.java)
//        val unmarshaller = context.createUnmarshaller()
//        val reader = StringReader(data as String)
//        val md = unmarshaller.unmarshal(reader) as Metadata
//        return mapToJson(md)
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        return "text/xml" == contentType
    }

    private fun mapToJson(md: Metadata): JsonNode {
        val mapper = ObjectMapper()
        val node = mapper.createObjectNode()
//        node.put("_id", md.fieldIdentifier)
//        node.put("metadataLanguage", md.getLanguage())
        return node
    }

    override val typeInfo: ImportTypeInfo
        get() = ImportTypeInfo(
            "iso",
            "ISO",
            "ISO Dokumente",
            emptyList()
        )
}