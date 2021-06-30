package de.ingrid.igeserver.imports

/**
 * @param category the category (data/address) of the exporter
 * @param id the ID of the exporter
 * @param name the display name of the exporter
 * @param description a description for the exporter
 * @param dataType defines the type of the resulting document (e.g. application/json)
 * @param profiles in which profiles can this exporter be used
 *
 */
data class ImportTypeInfo(val id: String, val name: String, val description: String, val profiles: List<String>)