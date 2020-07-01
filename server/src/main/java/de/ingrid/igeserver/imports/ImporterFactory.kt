package de.ingrid.igeserver.imports

import de.ingrid.ige.api.IgeImporter
import de.ingrid.igeserver.api.ApiException
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class ImporterFactory {
    private val log = logger()

    @Autowired
    private lateinit var importer: List<IgeImporter>

    @Throws(ApiException::class)
    fun getImporter(contentType: String, fileContent: String?): IgeImporter {

        val responsibleImporter = importer
                .filter { it.canHandleImportFile(contentType, fileContent) }

        handleEmptyOrMultipleImporter(responsibleImporter, contentType)

        return responsibleImporter[0]
    }

    private fun handleEmptyOrMultipleImporter(responsibleImporter: List<IgeImporter>, contentType: String) {
        if (responsibleImporter.isEmpty()) {
            val message = "No matching importer found that can handle the input file with contentType: $contentType"
            throw ApiException(message, true)
        } else if (responsibleImporter.size > 1) {
            val importerNames = responsibleImporter
                    .map { it.name }
                    .joinToString(",")

            val message = "There's more than one importer who wants to handle the import: $importerNames"
            throw ApiException(message, true)
        }
    }

}