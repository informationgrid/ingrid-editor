package de.ingrid.igeserver.ogc.exportCatalog

import de.ingrid.igeserver.services.DocumentCategory

/**
 * @param category the category (data/address) of the exporter
 * @param type the ID of the exporter
 * @param name the display name of the exporter
 * @param description a description for the exporter
 * @param dataType defines the type of the resulting document (e.g. application/json)
 * @param profiles in which profiles can this exporter be used
 *
 */
data class CatalogExportTypeInfo(val category: DocumentCategory, val type: String, val name: String, val description: String, val dataType: String, val fileExtension: String, val profiles: List<String>, val isPublic: Boolean = true)