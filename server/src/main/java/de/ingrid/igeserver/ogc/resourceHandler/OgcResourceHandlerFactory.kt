package de.ingrid.igeserver.ogc.resourceHandler

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.configuration.ConfigurationException
import de.ingrid.igeserver.imports.IgeImporter
import de.ingrid.igeserver.imports.ImportTypeInfo
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Profile("ogc-resources-api")
@Service
class OgcResourceHandlerFactory() {
    private val log = logger()

    @Autowired
    private lateinit var resourceHandler: List<OgcResourceHandler>

    fun getResourceHandlerById(id: String): OgcResourceHandler {
        return resourceHandler.find { it.typeInfo.id == id } ?: throw NotFoundException.withMissingResource(id, null)
    }

    fun getResourceHandlerInfos(): List<ResourceTypeInfo> {
        return resourceHandler.map { it.typeInfo }
    }

    fun getResourceHandler(profile: String): List<OgcResourceHandler> {

        val responsibleResourceHandler = resourceHandler
            .filter { it.canHandleResource(profile) }

        handleEmptyOrMultipleResourceHandler(responsibleResourceHandler, profile)

        return responsibleResourceHandler
    }

    private fun handleEmptyOrMultipleResourceHandler(responsibleImporter: List<OgcResourceHandler>, profile: String) {
        if (responsibleImporter.isEmpty()) {
            throw ConfigurationException.withReason("No importer found for profile type '$profile'.")
        } else if (responsibleImporter.size > 1) {
            val importerNames = responsibleImporter.joinToString(",") { it.typeInfo.name }
            throw ConfigurationException.withReason("More than one resource handler found for profile type '$profile': '$importerNames'.")
        }
    }

}