package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_DOCUMENT_TYPE
import de.ingrid.igeserver.services.FIELD_ID
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

    fun importFile(dbId: String, file: MultipartFile): Pair<JsonNode, String> {
        val type = file.contentType
        val fileContent = String(file.bytes, Charset.defaultCharset())
        val importer = factory.getImporter(type, fileContent)


        val importedDoc = importer.run(fileContent)

        log.debug("Transformed document: $importedDoc")

        dbService.acquireCatalog(dbId).use {
            extractAndSaveReferences(importedDoc)
        }

        // TODO: return created document instead of transformed JSON
        return Pair(importedDoc, importer.name)
    }

    private fun extractAndSaveReferences(doc: JsonNode) {

        val docType = doc[FIELD_DOCUMENT_TYPE].asText()
        val refType = documentService.getDocumentType(docType)

        val references = refType.pullReferences(doc)

        // save references
        // TODO: use option if we want to publish it
        references
            .filter { !documentAlreadyExists(it) }
            .forEach { documentService.createDocument(it, publish = false) }

        // save imported document

        // TODO: option for new UUID or overwrite
        if (documentAlreadyExists(doc)) {
            (doc as ObjectNode).remove(FIELD_ID)
        }
        
        // TODO: use option if we want to publish it
        documentService.createDocument(doc, publish = false)

    }

    private fun documentAlreadyExists(ref: JsonNode): Boolean {

        // TODO: optimize by caching reference information

        val id = ref.path(FIELD_ID).textValue()
        return try {
            documentService.getWrapperByDocumentId(id, false)
            true
        } catch (e: RuntimeException) {
            false
        }

    }

}
