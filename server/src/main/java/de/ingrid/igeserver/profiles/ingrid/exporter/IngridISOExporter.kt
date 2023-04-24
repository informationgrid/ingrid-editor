package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.mdek.upload.Config
import de.ingrid.utils.tool.XsltUtils
import de.ingrid.utils.xml.XMLUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service
import org.xml.sax.InputSource
import java.io.StringReader
import javax.xml.parsers.DocumentBuilderFactory


@Service
@Profile("ingrid")
class IngridISOExporter @Autowired constructor(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
) : IngridIDFExporter(codelistHandler, config, catalogService) {

    val XSL_IDF_TO_ISO_FULL = "idf_1_0_0_to_iso_metadata.xsl"

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISO",
        "Ingrid ISO",
        "Export von Ingrid Dokumenten ISO Format für die Anzeige im Portal.",
        "text/xml",
        "xml",
        listOf("ingrid")
    )

    override fun run(doc: Document, catalogId: String): String {
        val idfString = super.run(doc, catalogId)
        val idfDoc = convertStringToDocument(idfString)
        val isoDoc = XsltUtils().transform(idfDoc, XSL_IDF_TO_ISO_FULL)
        return XMLUtils.toString(isoDoc as org.w3c.dom.Document)
    }

    private fun convertStringToDocument(record: String): org.w3c.dom.Document? {
        try {
            val domFactory = DocumentBuilderFactory.newInstance()
            domFactory.isNamespaceAware = true
            val builder = domFactory.newDocumentBuilder()
            return builder.parse(InputSource(StringReader(record)))
        } catch (ex: Exception) {
            log.error("Could not convert String to Document Node: ", ex)
        }
        return null
    }

}
