package de.ingrid.igeserver.ogc.resourceHelper

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.configuration.ConfigurationException
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Service

@Profile("ogc-resources-api")
@Service
class OgcResourceHelperFactory() {
    private val log = logger()

    @Autowired
    private lateinit var resourceHelper: List<OgcResourceHelper>

    fun getResourceHelperById(id: String): OgcResourceHelper {
        return resourceHelper.find { it.typeInfo.id == id } ?: throw NotFoundException.withMissingResource(id, null)
    }

    fun getResourceHelperInfos(): List<ResourceTypeInfo> {
        return resourceHelper.map { it.typeInfo }
    }

    fun getResourceHelper(profile: String): List<OgcResourceHelper> {

        val responsibleResourceHelper = resourceHelper
            .filter { it.canHandleResource(profile) }

        handleEmptyOrMultipleResourceHelper(responsibleResourceHelper, profile)

        return responsibleResourceHelper
    }

    private fun handleEmptyOrMultipleResourceHelper(responsibleImporter: List<OgcResourceHelper>, profile: String) {
        if (responsibleImporter.isEmpty()) {
            throw ConfigurationException.withReason("No resource helper found for profile type '$profile'.")
        } else if (responsibleImporter.size > 1) {
            val importerNames = responsibleImporter.joinToString(",") { it.typeInfo.name }
            throw ConfigurationException.withReason("More than one resource helper found for profile type '$profile': '$importerNames'.")
        }
    }

}