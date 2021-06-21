package de.ingrid.igeserver.exports.iso

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentCategory
import java.io.StringWriter
import javax.xml.bind.JAXBContext
import javax.xml.bind.JAXBException
import javax.xml.bind.Marshaller

class IsoExporter : IgeExporter {
    override val typeInfo: ExportTypeInfo
        get() = ExportTypeInfo(DocumentCategory.DATA, "xxx", "IsoExporter", "", "text/xml", "xml", listOf())

    override fun run(doc: Document): Any {
        return mapMetadata(doc)
    }

    private fun mapMetadata(tree: Document): Metadata {
        val md = Metadata()
        md.setUuid(tree.data.path("_id").asText())
// TODO:       md.language = tree.data.path("metadataLanguage").path("value").asText()
        md.setCharacterSet(tree.data.path("").asText())
        md.setParentIdentifier(tree.data.path("_parent").asText(null))
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
