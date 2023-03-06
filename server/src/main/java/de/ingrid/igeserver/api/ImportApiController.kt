package de.ingrid.igeserver.api

import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.model.ImportAnalyzeInfo
import de.ingrid.igeserver.model.ImportAnalyzeResponse
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import org.springframework.web.multipart.MultipartFile
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class ImportApiController @Autowired constructor(
    private val importService: ImportService,
    private val catalogService: CatalogService
) : ImportApi {

    private val log = logger()
    override fun getImporter(principal: Principal, profile: String): ResponseEntity<List<ImportTypeInfo>> {
        val importer = importService.getImporterInfos()
        return ResponseEntity.ok(importer)
    }


    override fun importDataset(
        principal: Principal,
        file: MultipartFile,
        importerId: String,
        parentDoc: Int,
        parentAddress: Int,
        options: String
    ): ResponseEntity<ImportAnalyzeInfo> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        val optionsObj = ImportOptions(parentDoc, parentAddress, options)
        val (result, importerName) = importService.importFile(principal, dbId, importerId, file, optionsObj)
        val info = createInfo(importerName, result)
        return ResponseEntity.ok(info)
    }

    override fun analyzeFile(principal: Principal, file: MultipartFile): ResponseEntity<ImportAnalyzeResponse> {
        val response = importService.analyzeFile(file)
        return ResponseEntity.ok(response)
    }

    private fun createInfo(importerName: String, result: Document): ImportAnalyzeInfo {
        val info = ImportAnalyzeInfo()
        info.importType = importerName
        info.numDocuments = 1
        info.result = result

        return info
    }
}

data class ImportOptions(val parentDocument: Int, val parentAddress: Int, val options: String)
