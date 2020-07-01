package de.ingrid.igeserver.imports.iso

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.ObjectMapper
import de.ingrid.ige.api.IgeImporter
import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.exports.iso.Metadata
import org.apache.logging.log4j.kotlin.logger
import java.io.StringReader
import javax.xml.bind.JAXBContext
import javax.xml.bind.JAXBException

class IsoImporter : IgeImporter {

    private val log = logger()

    override fun run(data: Any): JsonNode {

        // input is XML
        val context: JAXBContext
        try {
            context = JAXBContext.newInstance(Metadata::class.java)
            val unmarshaller = context.createUnmarshaller()
            val reader = StringReader(data as String)
            val md = unmarshaller.unmarshal(reader) as Metadata
            return mapToJson(md)
        } catch (e: JAXBException) {
            log.error("Error importing ISO document", e);
            throw ApiException("Error importing ISO document: " + e.message)
        }
    }

    override fun canHandleImportFile(contentType: String, fileContent: String): Boolean {
        return "text/xml" == contentType
    }

    override fun getName(): String {
        return "ISO"
    }

    private fun mapToJson(md: Metadata): JsonNode {
        val mapper = ObjectMapper()
        val node = mapper.createObjectNode()
        node.put("_id", md.fieldIdentifier)
        node.put("metadataLanguage", md.language)
        return node
    }
}