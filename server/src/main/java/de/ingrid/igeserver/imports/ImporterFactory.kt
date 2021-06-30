package de.ingrid.igeserver.imports

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.configuration.ConfigurationException
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ImporterFactory {
    private val log = logger()

    @Autowired
    private lateinit var importer: List<IgeImporter>

    fun getImporterById(id: String): IgeImporter {
        return importer.find { it.typeInfo.id == id } ?: throw NotFoundException.withMissingResource(id, null)
    }

    fun getImporterInfos(): List<ImportTypeInfo> {
        return importer.map { it.typeInfo }
    }

    fun getImporter(contentType: String, fileContent: String): List<IgeImporter> {

        val responsibleImporter = importer
            .filter { it.canHandleImportFile(contentType, fileContent) }

        handleEmptyOrMultipleImporter(responsibleImporter, contentType)

        return responsibleImporter
    }

    private fun handleEmptyOrMultipleImporter(responsibleImporter: List<IgeImporter>, contentType: String) {
        if (responsibleImporter.isEmpty()) {
            throw ConfigurationException.withReason("No importer found for content type '$contentType' and its content.")
        } else if (responsibleImporter.size > 1) {
            val importerNames = responsibleImporter.joinToString(",") { it.typeInfo.name }
            throw ConfigurationException.withReason("More than one importer found for content type '$contentType': '$importerNames'.")
        }
    }

}
