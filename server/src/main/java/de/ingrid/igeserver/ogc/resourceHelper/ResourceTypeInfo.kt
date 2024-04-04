package de.ingrid.igeserver.ogc.resourceHelper

import org.springframework.context.annotation.Profile


/**
 * @param id the ID of the resource helper
 * @param name the display name of the resource helper
 * @param description a description for the resource helper
 * @param profiles in which profiles can this resource helper be used
 *
 */

@Profile("ogc-resources-api")
data class ResourceTypeInfo(val id: String, val name: String, val description: String, val profiles: List<String>)
