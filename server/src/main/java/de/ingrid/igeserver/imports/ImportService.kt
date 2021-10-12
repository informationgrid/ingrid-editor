package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.model.ImportAnalyzeResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_ID
import org.apache.http.entity.ContentType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.security.acls.model.NotFoundException
import org.springframework.stereotype.Service
import org.springframework.web.multipart.MultipartFile
import java.nio.charset.Charset
import java.util.*

@Service
class ImportService {
    private val log = logger()

    @Autowired
    lateinit var factory: ImporterFactory

    @Autowired
    lateinit var documentService: DocumentService

    fun analyzeFile(file: MultipartFile): ImportAnalyzeResponse {
        val type = file.contentType ?: ContentType.TEXT_PLAIN.mimeType!!
        val fileContent = String(file.bytes, Charset.defaultCharset())
        val importer = factory.getImporter(type, fileContent).map { it.typeInfo.id }

        return ImportAnalyzeResponse(importer, emptyList())

    }

    fun importFile(dbId: String, importerId: String, file: MultipartFile): Pair<Document, String> {
        val fileContent = String(file.bytes, Charset.defaultCharset())
        val importer = factory.getImporterById(importerId)

        val importedDoc = importer.run(fileContent)

        log.debug("Transformed document: $importedDoc")
        /*val doc = documentService.convertToDocument((importedDoc as ArrayNode)[0])
*/
        // TODO: if import under a special folder then create new UUIDs for docs
        //       doc.uuid = UUID.randomUUID().toString()


        val document = importedDoc[0]
        val uuid = document.get(FIELD_ID)
        // check if document already exists
        val wrapper = try {
            documentService.getWrapperByDocumentId(uuid.asText())
        } catch (ex: NotFoundException) {
            null
        } catch (ex: EmptyResultDataAccessException) {
            null
        }

        val createDocument = if (wrapper == null) {
            documentService.createDocument(dbId, document, null, false, false)
        } else {
            (document as ObjectNode).put(FIELD_ID, UUID.randomUUID().toString())
            documentService.createDocument(dbId, document, null, false, false)
//            documentService.updateDocument(dbId, uuid, document, null, false, false)
        }
        val doc = documentService.convertToDocument(createDocument)

//        extractAndSaveReferences(createDocument)

        // TODO: return created document instead of transformed JSON
        return Pair(doc, importer.typeInfo.id)
    }

    private fun extractAndSaveReferences(doc: Document) {
/* TODO: migrate
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
        documentService.createDocument(doc, publish = false)*/

    }

    private fun documentAlreadyExists(ref: JsonNode): Boolean {

        // TODO: optimize by caching reference information

        val id = ref.path(FIELD_ID).textValue()
        return try {
            documentService.getWrapperByDocumentId(id)
            true
        } catch (e: RuntimeException) {
            false
        }

    }

    fun getImporterInfos(): List<ImportTypeInfo> {
        return factory.getImporterInfos()
    }

}
