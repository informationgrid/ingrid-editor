package de.ingrid.igeserver.ogc.resourceHandler

import org.springframework.context.annotation.Profile


/**
 * @param id the ID of the resource handler
 * @param name the display name of the resource handler
 * @param description a description for the resource handler
 * @param profiles in which profiles can this resource handler be used
 *
 */

@Profile("ogc-resources-api")
data class ResourceTypeInfo(val id: String, val name: String, val description: String, val profiles: List<String>)
