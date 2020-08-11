package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.model.ImportAnalyzeInfo
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.io.IOException
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class ImportApiController @Autowired constructor(private val importService: ImportService, private val catalogService: CatalogService) : ImportApi {

    private val log = logger()

    @Throws(IOException::class, ApiException::class)
    override fun importDataset(principal: Principal?, file: MultipartFile): ResponseEntity<ImportAnalyzeInfo> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        val (result, importerName) = importService.importFile(dbId, file)
        val info = createInfo(importerName, result)
        return ResponseEntity.ok(info)
    }

    private fun createInfo(importerName: String, result: JsonNode): ImportAnalyzeInfo {
        val info = ImportAnalyzeInfo()
        info.importType = importerName
        info.numDocuments = 1
        info.result = result

        return info
    }

}