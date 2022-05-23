package de.ingrid.igeserver.services

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.exports.ExporterFactory
import de.ingrid.igeserver.exports.IgeExporter
import de.ingrid.igeserver.model.ExportMethod
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.persistence.model.UpdateReferenceOptions
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import java.io.BufferedInputStream
import java.io.ByteArrayOutputStream

@Service
class ExportService @Autowired constructor(val exporterFactory: ExporterFactory) {

    private val log = logger()
    
    @Autowired
    @Lazy
    private lateinit var documentService: DocumentService

    fun getExporter(category: DocumentCategory, format: String): IgeExporter =
        exporterFactory.getExporter(category, format)

    fun getExportTypes(profile: String): List<ExportTypeInfo> {
        return exporterFactory.typeInfos
            .filter { it.profiles.isEmpty() || it.profiles.contains(profile) }
    }

    fun export(catalogId: String, options: ExportRequestParameter): ByteArray {
        // TODO: option to export addresses too?
        val doc = documentService.getWrapperByDocumentIdAndCatalog(catalogId, options.id)

        return if (options.method == ExportMethod.dataset) {
            if (doc.type == "FOLDER") {
                throw ServerException.withReason("Folders cannot be exported as single dataset")
            }
            handleSingleDataset(options, doc, catalogId).toByteArray()
        } else {
            val result =
                handleWithSubDocuments(doc, options, catalogId, options.method === ExportMethod.datasetAndBelow)
            result.joinToString().toByteArray()
            // zipToFile(result)
        }

    }

    private fun zipToFile(result: List<String>): ByteArray {
//        val files: Array<String> = arrayOf("/home/matte/theres_no_place.png", "/home/matte/vladstudio_the_moon_and_the_ocean_1920x1440_signed.jpg")
        //ZipOutputStream(BufferedOutputStream(FileOutputStream("/home/matte/Desktop/test.zip"))).use { out ->
        ByteArrayOutputStream().use { out ->
            val a = "asas"
            a.byteInputStream().use { fi ->
                BufferedInputStream(fi).use { origin ->
//                    val entry = ZipEntry("test.zip")
//                    out.putNextEntry(entry)
                    origin.copyTo(out, 1024)
                }
            }

            return out.toByteArray()
            /*for (file in files) {
                FileInputStream(file).use { fi ->
                    BufferedInputStream(fi).use { origin ->
                        val entry = ZipEntry(file.substring(file.lastIndexOf("/")))
                        out.putNextEntry(entry)
                        origin.copyTo(out, 1024)
                    }
                }
            }*/
        }
    }

    private fun handleSingleDataset(
        options: ExportRequestParameter,
        doc: DocumentWrapper,
        catalogId: String
    ): String {
        return try {
            val docOptions = UpdateReferenceOptions(!options.useDraft, true)
            val docVersion = documentService.getLatestDocument(doc, docOptions, catalogId = catalogId)
            val exporter = getExporter(DocumentCategory.DATA, options.exportFormat)
            val result = exporter.run(docVersion, catalogId)
            if (result is ObjectNode) result.toPrettyString() else result as String
        } catch (ex: NotFoundException) {
            if (options.useDraft) {
                throw ex
            }
            log.info("No published version of ${doc.uuid} found. Will not be exported.")
            ""
        }
    }

    private fun handleWithSubDocuments(
        doc: DocumentWrapper,
        options: ExportRequestParameter,
        catalogId: String,
        includeParent: Boolean
    ): List<String> {
        val isFolder = doc.type == "FOLDER"
        val result = if (includeParent && !isFolder)
            handleSingleDataset(options, doc, catalogId)
        else null

        val children = documentService.findChildren(catalogId, doc.id)
        val resultList = children.hits.flatMap { handleWithSubDocuments(it, options, catalogId, true) }
        return if (result == null)
            resultList
        else
            resultList + result

    }
}