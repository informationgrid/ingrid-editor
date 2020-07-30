package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import java.io.StringWriter
import javax.xml.bind.JAXBContext
import javax.xml.bind.JAXBException
import javax.xml.bind.Marshaller

class IsoExporter : IgeExporter {
    override val typeInfo: ExportTypeInfo
        get() = ExportTypeInfo("xxx", "IsoExporter", "", listOf())

    override fun run(jsonData: JsonNode): Any {
        return mapMetadata(jsonData)
    }

    private fun mapMetadata(tree: JsonNode): Metadata {
        val md = Metadata()
        md.setUuid(tree.path("_id").asText())
        md.language = tree.path("metadataLanguage").path("value").asText()
        md.setCharacterSet(tree.path("").asText())
        md.setParentIdentifier(tree.path("_parent").asText(null))
        md.setHierarchyLevel("dataset")
        md.setContact("12345", "pointOfContact")
        md.setDateStamp("1978-10-10")
        return md
    }

    override fun toString(exportedObject: Any): String {
        val stringWriter = StringWriter()
        try {
            val context = JAXBContext.newInstance(Metadata::class.java)
            val marshaller = context.createMarshaller()
            marshaller.setProperty(Marshaller.JAXB_FORMATTED_OUTPUT, true)
            marshaller.marshal(exportedObject, System.out)
            marshaller.marshal(exportedObject, stringWriter)
        } catch (e: JAXBException) {
            // TODO Auto-generated catch block
            e.printStackTrace()
        }
        return stringWriter.toString()
    }
}