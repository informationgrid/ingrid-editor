package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.api.ImportOptions
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.api.messaging.*
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.DOCUMENT_STATE
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_PARENT
import org.apache.http.entity.ContentType
import org.apache.logging.log4j.LogManager
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service
import org.springframework.transaction.annotation.Transactional
import java.io.ByteArrayOutputStream
import java.io.File
import java.io.InputStream
import java.util.function.BiConsumer
import java.util.zip.ZipEntry
import java.util.zip.ZipInputStream

@Service
class ImportService constructor(
    val notifier: JobsNotifier,
    val factory: ImporterFactory,
    val documentService: DocumentService,

    ) {

    companion object {
        private val log = LogManager.getLogger()
        const val jobKey: String = "import"
    }

    fun analyzeFile(
        catalogId: String,
        fileLocation: String,
        message: Message,
        forceImporter: String? = null
    ): OptimizedImportAnalysis {
        val notificationType = MessageTarget(NotificationType.IMPORT, catalogId)
        val file = File(fileLocation)
        val contentType = file.toURI().toURL().openConnection().contentType
        val type =
            if (contentType == null || contentType == "content/unknown") ContentType.TEXT_PLAIN.mimeType else contentType

        notifier.sendMessage(notificationType, message.apply { this.message = "Start analysis" })

        if (type == "application/zip") {
            val totalFiles: Int
            val importers: List<String>
            return handleZipImport(catalogId, file)
                .also { totalFiles = it.documents.size }
                .also { importers = it.importers }
                .documents
                .mapIndexed { index, fileContent ->
                    val progress = ((index + 1f) / totalFiles) * 100
                    notifier.sendMessage(notificationType, message.apply { this.progress = progress.toInt() })
                    val result = if (fileContent is ArrayNode) fileContent[0] else fileContent
                    analyzeDoc(catalogId, result)
                }
                .toList().let { prepareForImport(importers, it) }
        }

        val fileContent = file.readText(Charsets.UTF_8)
        val importer = factory.getImporter(type, fileContent)

        val result = importer[0].run(catalogId, fileContent)
        return if (result is ArrayNode) {
            prepareForImport(importer.map { it.typeInfo.id }, listOf(analyzeDoc(catalogId, result[0])))
        } else {
            prepareForImport(importer.map { it.typeInfo.id }, listOf(analyzeDoc(catalogId, result)))
        }
    }

    private fun prepareForImport(importers: List<String>, analysis: List<DocumentAnalysis>): OptimizedImportAnalysis {

        val sortedListOfAllReferences = prepareDocuments(analysis)

        return OptimizedImportAnalysis(
            importers,
            sortedListOfAllReferences,
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

    private fun prepareDocuments(analysis: List<DocumentAnalysis>): List<DocumentAnalysis> {

        return analysis
            .flatMap { it.references + it }
            .distinctBy { it.document.uuid }
            .sortedWith(ReferenceComparator)

    }

    private class ReferenceComparator {

        companion object : Comparator<DocumentAnalysis> {

            override fun compare(a: DocumentAnalysis, b: DocumentAnalysis): Int {
                return when {
                    // if other document is in reference list of first document, then it must be listed before
                    a.references.any { it.document.uuid == b.document.uuid } -> 1
                    b.references.any { it.document.uuid == a.document.uuid } -> -1
                    else -> 0
                }
            }
        }
    }

    private fun handleZipImport(catalogId: String, file: File): ExtractedZip {
        val docs = mutableListOf<JsonNode>()
        val importers = mutableSetOf<String>()

        extractZip(file.inputStream()) { entry, os ->
            run {
                val type = when {
                    entry.name.endsWith(".json") -> ContentType.APPLICATION_JSON.mimeType
                    entry.name.endsWith(".xml") -> ContentType.APPLICATION_XML.mimeType
                    else -> null
                }
                val importer = factory.getImporter(type.toString(), os.toString())
                val result = importer[0].run(catalogId, os.toString())
                docs.add(result)
                importers.addAll(importer.map { it.typeInfo.id })
            }
        }
        log.info("Converted ${docs.size} documents ...")

        return ExtractedZip(importers.toList(), docs)
    }

    private fun analyzeDoc(catalogId: String, doc: JsonNode): DocumentAnalysis {
        val document = documentService.convertToDocument(doc)
        document.state = DOCUMENT_STATE.DRAFT
        document.isLatest = true
        val documentWrapper = getDocumentWrapperOrNull(catalogId, document.uuid)

        val refType = documentService.getDocumentType(document.type)

        val references = refType.pullReferences(document)
            .map {
                val wrapper = getDocumentWrapperOrNull(catalogId, it.uuid)
                it.state = DOCUMENT_STATE.DRAFT
                document.isLatest = true
                DocumentAnalysis(it, wrapper?.id, isAddress(it.type), wrapper != null, wrapper?.deleted == 1)
            }

        return DocumentAnalysis(
            document,
            documentWrapper?.id,
            isAddress(document.type),
            documentWrapper != null,
            documentWrapper?.deleted == 1,
            references
        )
    }

    private fun isAddress(documentType: String) =
        documentService.getDocumentType(documentType).category == DocumentCategory.ADDRESS.value

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
                consumerFunction.accept(entry!!, outStream)
            }

        }
    }

    private fun getDocumentWrapperOrNull(catalogId: String, uuid: String?): DocumentWrapper? {
        return try {
            if (uuid == null) {
                null
            } else {
                documentService.getWrapperByCatalogAndDocumentUuid(catalogId, uuid, true)
            }
        } catch (ex: NotFoundException) {
            null
        }
    }

    @Transactional
    fun importAnalyzedDatasets(
        principal: Authentication,
        catalogId: String,
        analysis: OptimizedImportAnalysis,
        options: ImportOptions,
        message: Message
    ): ImportCounter {

        val counter = ImportCounter()
        val notificationType = MessageTarget(NotificationType.IMPORT, catalogId)

        analysis.references.forEachIndexed { index, ref ->
            val progress = ((index + 1f) / analysis.references.size) * 100
            notifier.sendMessage(notificationType, message.apply { this.progress = progress.toInt() })
            handleParent(ref, options)
            importReference(principal, catalogId, ref, options, counter)
        }

        log.info("Import result: $counter")
        return counter
    }

    private fun importReference(
        principal: Authentication,
        catalogId: String,
        ref: DocumentAnalysis,
        options: ImportOptions,
        counter: ImportCounter
    ) {

        if (ref.isAddress && ref.document.title.isNullOrEmpty()) {
            val data = ref.document.data
            ref.document.title = if (data.has("organization")) 
                data.get("organization").asText() 
            else "${data.get("lastName").asText()}, ${data.get("firstName").asText()}"
        }

        if (!ref.exists) {
            val parent = if (ref.isAddress) options.parentAddress else options.parentDocument
            documentService.createDocument(principal, catalogId, ref.document, parent, ref.isAddress, options.publish)
            if (ref.isAddress) counter.addresses++ else counter.documents++
        } else if (ref.isAddress && options.overwriteAddresses || !ref.isAddress && options.overwriteDatasets) {
            // special case when document with uuid has been deleted
            if (ref.deleted) removeDeletedFlag(ref.wrapperId!!)

            setVersionInfo(catalogId, ref.wrapperId!!, ref.document)
            if (options.publish) {
                documentService.publishDocument(principal, catalogId, ref.wrapperId, ref.document)
            } else {
                documentService.updateDocument(principal, catalogId, ref.wrapperId, ref.document)

                // special case when document was deleted and had published version
                // => after import in draft state, we don't want to see the deleted published version
                if (ref.deleted) handleDeletedPublishedVersion(catalogId, ref.document.uuid, ref.wrapperId)
            }
            counter.overwritten++
        } else {
            counter.skipped++
        }
    }

    /**
     * In case we recover a deleted document which was published before, we need to adjust the documents
     * if and only if we import a document with the same UUID in draft-state.
     *
     * In that case the published version will be marked as archived and the draft version, which had
     * the state DRAFT_ADN_PUBLISHED will be set to DRAFT, so that the new imported version has no
     * knowledge of the published version. However, it's still possible to access this version internally.
     */
    private fun handleDeletedPublishedVersion(catalogId: String, uuid: String, wrapperId: Int) {
        try {
            documentService.getLastPublishedDocument(catalogId, uuid).also {
                it.state = DOCUMENT_STATE.ARCHIVED
                documentService.docRepo.save(it)
            }
            documentService.getDocumentFromCatalog(catalogId, wrapperId).also {
                it.document.state = DOCUMENT_STATE.DRAFT
                documentService.docRepo.save(it.document)
            }
        } catch (e: Exception) {
            // no published document exists -> do nothing
        }
    }

    private fun removeDeletedFlag(wrapperId: Int) {
        documentService.recoverDocument(wrapperId)
    }

    private fun setVersionInfo(catalogId: String, wrapperId: Int, document: Document) {
        document.version =
            documentService.getDocumentFromCatalog(catalogId, wrapperId).document.version
    }

    private fun handleParent(documentInfo: DocumentAnalysis, options: ImportOptions) {
        when (documentInfo.isAddress) {
            true -> documentInfo.document.data.put(FIELD_PARENT, options.parentAddress)
            false -> documentInfo.document.data.put(FIELD_PARENT, options.parentDocument)
        }
    }

}

data class DocumentAnalysis(
    val document: Document,
    val wrapperId: Int?,
    val isAddress: Boolean,
    val exists: Boolean,
    val deleted: Boolean,
    val references: List<DocumentAnalysis> = emptyList()
)

data class OptimizedImportAnalysis(
    val importers: List<String>,
    val references: List<DocumentAnalysis>,
    val numDatasets: Int,
    val numAddresses: Int,
    val existingDatasets: List<DatasetInfo>,
    val existingAddresses: List<DatasetInfo>,
    var importResult: ImportCounter? = null
)

data class ExtractedZip(
    val importers: List<String>,
    val documents: List<JsonNode>
)

data class ImportCounter(
    var documents: Int = 0,
    var addresses: Int = 0,
    var overwritten: Int = 0,
    var skipped: Int = 0
)