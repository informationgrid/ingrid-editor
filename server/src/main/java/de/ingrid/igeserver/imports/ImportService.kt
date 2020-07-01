package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.services.DocumentService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.charset.Charset

@Service
class ImportService {
    private val log = logger()

    @Autowired
    lateinit var factory: ImporterFactory

    @Autowired
    lateinit var documentService: DocumentService

    @Autowired
    lateinit var dbService: DBApi

    fun importFile(dbId: String?, file: MultipartFile): Pair<JsonNode, String> {
        val type = file.contentType
        val fileContent = String(file.bytes, Charset.defaultCharset())
        val importer = factory.getImporter(type, fileContent)


        val importedDoc = importer.run(fileContent)

        log.debug("Transformed document: $importedDoc")

        dbService.acquire(dbId).use {
            documentService.createDocument(importedDoc)
        }

        // TODO: return created document instead of transformed JSON
        return Pair(importedDoc, importer.name)
    }

}