package de.ingrid.igeserver.api

import de.ingrid.igeserver.api.ApiException
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.ImporterFactory
import de.ingrid.igeserver.model.ImportAnalyzeInfo
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.nio.charset.Charset

@RestController
@RequestMapping(path = ["/api"])
class ImportApiController @Autowired constructor(private val importService: ImportService) : ImportApi {

    private val log = logger()

    @Autowired
    lateinit var factory: ImporterFactory

    @Throws(IOException::class, ApiException::class)
    override fun importDataset(file: MultipartFile): ResponseEntity<ImportAnalyzeInfo> {
        val type = file.contentType
        val fileContent = String(file.bytes, Charset.defaultCharset())
        val importer = factory.getImporter(type, fileContent)
        val result = importer.run(fileContent)
        val info = ImportAnalyzeInfo()
        info.importType = importer.name
        info.numDocuments = 1
        info.result = result
        return ResponseEntity.ok(info)
    }

}