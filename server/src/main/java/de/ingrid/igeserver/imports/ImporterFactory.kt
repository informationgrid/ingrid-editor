package de.ingrid.igeserver.imports

import de.ingrid.ige.api.IgeImporter
import de.ingrid.igeserver.configuration.ConfigurationException
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ImporterFactory {
    private val log = logger()

    @Autowired
    private lateinit var importer: List<IgeImporter>

    fun getImporter(contentType: String, fileContent: String?): IgeImporter {

        val responsibleImporter = importer
                .filter { it.canHandleImportFile(contentType, fileContent) }

        handleEmptyOrMultipleImporter(responsibleImporter, contentType)

        return responsibleImporter[0]
    }

    private fun handleEmptyOrMultipleImporter(responsibleImporter: List<IgeImporter>, contentType: String) {
        if (responsibleImporter.isEmpty()) {
            throw ConfigurationException.withReason("No importer found for content type '$contentType' and its content.")
        } else if (responsibleImporter.size > 1) {
            val importerNames = responsibleImporter.joinToString(",") { it.name }
            throw ConfigurationException.withReason("More than one importer found for content type '$contentType': '$importerNames'.")
        }
    }

}
