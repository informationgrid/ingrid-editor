package de.ingrid.igeserver.ogc.exportCatalog

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog

interface OgcCatalogExporter {
    val typeInfo: CatalogExportTypeInfo

    fun run(catalog: Catalog): Any

}