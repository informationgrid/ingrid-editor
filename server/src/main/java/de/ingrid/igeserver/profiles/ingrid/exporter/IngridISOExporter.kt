package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.mdek.upload.Config
import de.ingrid.utils.xml.XMLUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Service
@Profile("ingrid")
class IngridISOExporter @Autowired constructor(
        codelistHandler: CodelistHandler,
        config: Config,
        catalogService: CatalogService,
) : IngridIDFExporter(codelistHandler, config, catalogService) {

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
        val isoDoc = transformIDFtoIso(idfDoc!!)
        return XMLUtils.toString(isoDoc)
    }

}
