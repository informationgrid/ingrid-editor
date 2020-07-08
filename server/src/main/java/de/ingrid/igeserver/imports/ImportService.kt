package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.document.DocumentType
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

    fun importFile(dbId: String?, file: MultipartFile): Pair<JsonNode, String> {
        val type = file.contentType
        val fileContent = String(file.bytes, Charset.defaultCharset())
        val importer = factory.getImporter(type, fileContent)


        val importedDoc = importer.run(fileContent)

        log.debug("Transformed document: $importedDoc")

        dbService.acquire(dbId).use {
            extractAndSaveReferences(importedDoc)
        }

        // TODO: return created document instead of transformed JSON
        return Pair(importedDoc, importer.name)
    }

    private fun extractAndSaveReferences(doc: JsonNode) {

        val docType = doc[FIELD_DOCUMENT_TYPE].asText()
        val refType = documentService.getDocumentType(docType)

        val references = refType.handleLinkedFields(doc)

        // save references
        references
                .filter { !referenceAlreadyExists(it) }
                .forEach { documentService.createDocument(it) }

        // save imported document
        documentService.createDocument(doc)

    }

    private fun referenceAlreadyExists(ref: JsonNode): Boolean {

        // TODO: optimize by caching reference information

        val id = ref.path(FIELD_ID).textValue()
        try {
            documentService.getByDocId(id, DocumentType::class, false)
            return true
        } catch (e: RuntimeException) {
            return false
        }

    }

}