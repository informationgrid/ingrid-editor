package de.ingrid.igeserver.ogc.exportCatalog.ingridISO

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.ogc.exportCatalog.CatalogExportTypeInfo
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.exporter.*
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.xml.XMLUtils
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service


@Service
@Profile("ogc-api")
class IngridIsoCatalogExporter @Autowired constructor(

) : OgcCatalogExporter {

    override val typeInfo = CatalogExportTypeInfo(
            DocumentCategory.DATA,
            "ingridISO",
            "ISO 19139",
            "Export von Ingrid Dokumenten ISO Format für die Anzeige im Portal.",
            "text/xml",
            "xml",
            listOf("ingrid")
    )

    override fun run(catalog: Catalog): String {
//        val indexString = super.run(doc, catalogId, options) as String
        val indexString = catalog.toString()
        val elasticDoc = jacksonObjectMapper().readValue<ElasticDocument>(indexString)
        val idfDoc = convertStringToDocument(elasticDoc["idf"] as String)
        val isoDoc = transformIDFtoIso(idfDoc!!)
        return XMLUtils.toString(isoDoc)
//        return catalog.toString()
    }

}
