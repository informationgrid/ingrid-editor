package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.model.ImportAnalyzeResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.*
import org.apache.http.entity.ContentType
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import org.springframework.web.multipart.MultipartFile
import java.nio.charset.Charset
import java.security.Principal
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

    @Transactional
    fun importFile(
        principal: Principal,
        catalogId: String,
        importerId: String,
        file: MultipartFile,
        options: ImportOptions
    ): Pair<Document, String> {
        val fileContent = String(file.bytes, Charset.defaultCharset())
        val importer = factory.getImporterById(importerId)

        val importedDoc = importer.run(fileContent)

        val document = importedDoc[0]
        handleOptions(document as ObjectNode, options)

        log.debug("Transformed document: $document")

        // TODO: should we fail if there's no UUID? Imported document might not have a unique ID!?
        val uuid = document.get(FIELD_UUID)?.asText()
        
        // check if document already exists
        val wrapper = try {
            if (uuid == null) {
                null
            } else {
                documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)
            }
        } catch (ex: NotFoundException) {
            null
        }

        val docObjForAddresses = documentService.convertToDocument(document)
        extractAndSaveReferences(principal, catalogId, docObjForAddresses, options)

        val docObj = documentService.convertToDocument(document)

        val createDocument = if (wrapper == null || options.options == "create_under_target") {
            documentService.createDocument(
                principal,
                catalogId,
                document,
                options.parentDocument,
                false,
                false
            )
        } else {
            // only when version matches in updated document, it'll be overwritten
            // otherwise a new document is created and wrapper links to original instead the updated one
            val docData = documentService.getDocumentFromCatalog(catalogId, wrapper.id!!)
            docObj.version = docData.document.version
            documentService.updateDocument(principal, catalogId, wrapper.id!!, docObj)
        }

        return Pair(createDocument.document, importer.typeInfo.id)
    }

    private fun handleOptions(
        document: ObjectNode,
        options: ImportOptions
    ) {
        if (options.options == "create_under_target") {
            document.put(FIELD_PARENT, options.parentDocument)
            // if import under a special folder then create new UUIDs for docs
            document.put(FIELD_ID, UUID.randomUUID().toString())
        }
    }

    private fun extractAndSaveReferences(
        principal: Principal,
        catalogId: String,
        doc: Document,
        options: ImportOptions
    ) {

        val refType = documentService.getDocumentType(doc.type)

        val references = refType.pullReferences(doc)

        // save references
        // TODO: use option if we want to publish it
        // TODO: prevent conversion to Document and JsonNode
        references
            .filter { !documentAlreadyExists(catalogId, it) }
            .map {
                // create address under given folder
                it.data.put(FIELD_PARENT, options.parentAddress)
                it.state = DOCUMENT_STATE.DRAFT
                val json = documentService.convertToJsonNode(it)
                documentService.removeInternalFieldsForImport(json as ObjectNode)
                json
            }
            .forEach {
                documentService.createDocument(
                    principal,
                    catalogId,
                    it,
                    parentId = options.parentAddress,
                    publish = false
                )
            }

    }

    private fun documentAlreadyExists(catalogId: String, ref: Document): Boolean {

        // TODO: optimize by caching reference information

        return try {
            documentService.getWrapperByCatalogAndDocumentUuid(catalogId, ref.uuid)
            true
        } catch (e: NotFoundException) {
            false
        }

    }

    fun getImporterInfos(): List<ImportTypeInfo> {
        return factory.getImporterInfos()
    }

}
