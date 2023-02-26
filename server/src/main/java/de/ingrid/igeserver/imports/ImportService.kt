package de.ingrid.igeserver.imports

import de.ingrid.igeserver.tasks.quartz.ImportAnalyzeTask
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import com.fasterxml.jackson.module.kotlin.readValues
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.messaging.*
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.*
import org.apache.http.entity.ContentType
import org.apache.logging.log4j.kotlin.logger
import org.quartz.JobKey
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.nio.charset.Charset
import java.util.*
import java.util.function.BiConsumer
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

class ImportMessage(override val startTime: Date = Date()) : Message() {
    var report: OptimizedImportAnalysis? = null
}

@Service
class ImportService constructor(
    val notifier: JobsNotifier,
    val factory: ImporterFactory,
    val documentService: DocumentService,
    val schedulerService: SchedulerService
    
) {
    private val log = logger()

    val notificationType = MessageTarget(NotificationType.IMPORT, "uvp_catalog")

    companion object {
        const val jobKey: String = "import"
    }

    fun analyzeFile(catalogId: String, fileLocation: String, forceImporter: String? = null): OptimizedImportAnalysis {
        val file = File(fileLocation)
        val contentType = file.toURI().toURL().openConnection().contentType
        val type = contentType ?: ContentType.TEXT_PLAIN.mimeType

        val message = ImportMessage()
        notifier.sendMessage(notificationType, message.apply { this.message = "Start analysis" })

        if (type == "application/zip") {
            val totalFiles: Int
            return handleZipImport(file)
                .also { totalFiles = it.size }
                .mapIndexed { index, fileContent ->
                    val progress = ((index + 1f) / totalFiles) * 100
                    notifier.sendMessage(notificationType, message.apply { this.progress = progress.toInt() })
                    // TODO: remove artificial wait
                    Thread.sleep(300)
                    analyzeDoc(catalogId, fileContent[0])
                }
                .toList().let { prepareForImport(it) }
        }

        val fileContent = String(file.readBytes(), Charset.defaultCharset())
        val importer = factory.getImporter(type, fileContent)

        val result = importer[0].run(fileContent)
        return prepareForImport(listOf(analyzeDoc(catalogId, result[0])))
    }

    private fun prepareForImport(analysis: List<DocumentAnalysis>) : OptimizedImportAnalysis {
        
        return OptimizedImportAnalysis(
            emptyList(),
            analysis.size,
            analysis.flatMap { it.references.map { it.document.uuid } }.distinct().size,
            analysis.filter { it.exists }
                .map { DatasetInfo(it.document.title ?: "???", it.document.type, it.document.uuid) },
            analysis.flatMap {
                it.references
                    .filter { it.exists }
                    .map { DatasetInfo(it.document.title ?: "???", it.document.type, it.document.uuid) }
            }.distinctBy { it.uuid }
        )
        
    }

    private fun handleZipImport(file: File): List<JsonNode> {
        val docs = mutableListOf<JsonNode>()

        extractZip(file.inputStream()) { entry, os ->
            run {
                val type = when {
                    entry.name.endsWith(".json") -> ContentType.APPLICATION_JSON.mimeType
                    entry.name.endsWith(".xml") -> ContentType.APPLICATION_XML.mimeType
                    else -> null
                }
                val importer = factory.getImporter(type.toString(), os.toString())
                val result = importer[0].run(os.toString())
                docs.add(result)
            }
        }
        log.info("Converted ${docs.size} documents ...")

        return docs
    }

    private fun analyzeDoc(catalogId: String, doc: JsonNode): DocumentAnalysis {
        val document = documentService.convertToDocument(doc)
        val documentWrapper = getDocumentWrapperOrNull(catalogId, document.uuid)
         
        val refType = documentService.getDocumentType(document.type)

        val references = refType.pullReferences(document)
            .map {
                val wrapper = getDocumentWrapperOrNull(catalogId, it.uuid)
                DocumentAnalysis(it, wrapper?.id, isAddress(document.type), wrapper != null) }

        return DocumentAnalysis(
            document, 
            documentWrapper?.id,
            isAddress(document.type), 
            documentWrapper != null,
            references
        )
    }

    private fun isAddress(documentType: String) =
        documentService.getDocumentType(documentType).category == DocumentCategory.ADDRESS.value

    /*
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
                val doc = documentService.createDocument(
                    principal,
                    catalogId,
                    document,
                    options.parentDocument.toInt(),
                    false,
                    false
                )
                documentService.convertToDocument(doc)
            } else {
                // only when version matches in updated document, it'll be overwritten
                // otherwise a new document is created and wrapper links to original instead the updated one
                docObj.version = wrapper.draft?.version ?: wrapper.published?.version
                documentService.updateDocument(principal, catalogId, wrapper.id!!, docObj, false)
            }
    
            // TODO: return created document instead of transformed JSON
            return Pair(createDocument, importer.typeInfo.id)
        }
    */

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

    /*private fun extractAndSaveReferences(
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
                val json = documentService.convertToJsonNode(it)
                documentService.removeInternalFieldsForImport(json as ObjectNode)
                json
            }
            .forEach {
                documentService.createDocument(
                    principal,
                    catalogId,
                    it,
                    parentId = options.parentAddress.toInt(),
                    publish = false
                )
            }

    }*/
    
    fun getImporterInfos(): List<ImportTypeInfo> {
        return factory.getImporterInfos()
    }

    private fun extractZip(file: InputStream, consumerFunction: BiConsumer<ZipEntry, ByteArrayOutputStream>) {
        ZipInputStream(file).use { zip ->
            var entry: ZipEntry?
            while (zip.nextEntry.also { entry = it } != null) {
                val outStream = ByteArrayOutputStream()
                val buffer = ByteArray(1024)
                var length: Int
                while (zip.read(buffer).also { length = it } != -1) {
                    outStream.write(buffer, 0, length)
                }
//                if (entry!!.name.endsWith(".zip")) {
//                    // need to go deeper...
//                    val inStream = ByteArrayInputStream(outStream.toByteArray())
//                    readZipInputStream(inStream, consumerFunction)
//                } else {
                // do something...
                consumerFunction.accept(entry!!, outStream)
//                }
            }

        }
    }

    private fun getDocumentWrapperOrNull(catalogId: String, uuid: String?): DocumentWrapper? {
        return try {
            if (uuid == null) {
                null
            } else {
                documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid)
            }
        } catch (ex: NotFoundException) {
            null
        }
    }

    fun importAnalyzedDatasets(principal: Authentication, catalogId: String, analysis: OptimizedImportAnalysis) {

        analysis.references.forEach { 
            if (!it.exists) {
                documentService.createDocument(principal, catalogId, it.document, null, it.isAddress)
            }/* else if (option.overwrite) {
                documentService.updateDocument(null, catalogId, it.wrapperId, it.document)
            }*/
        }

    }
    
}

data class DocumentAnalysis(
    val document: Document,
    val wrapperId: Int?,
    val isAddress: Boolean,
    val exists: Boolean,
    val references: List<DocumentAnalysis> = emptyList()
)

data class OptimizedImportAnalysis(
    val references: List<DocumentAnalysis>,
    val numDatasets: Int,
    val numAddresses: Int,
    val existingDatasets: List<DatasetInfo>,
    val existingAddresses: List<DatasetInfo>,
)