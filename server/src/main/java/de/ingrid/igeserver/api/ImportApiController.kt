package de.ingrid.igeserver.api

import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.ImportTypeInfo
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.LogManager
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

    companion object {
        private val log = LogManager.getLogger()
    }
    override fun getImporter(principal: Principal, profile: String): ResponseEntity<List<ImportTypeInfo>> {
        val importer = importService.getImporterInfos()
        return ResponseEntity.ok(importer)
    }

    override fun analyzeFile(principal: Principal, file: MultipartFile): ResponseEntity<Unit> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
//        val response = importService.analyzeFile(catalogId, file)
        return ResponseEntity.ok().build()
    }

}

data class ImportOptions(
    val parentDocument: Int? = null,
    val parentAddress: Int? = null, 
    val publish: Boolean = false, 
    val overwriteAddresses: Boolean = false, 
    val overwriteDatasets: Boolean = true)
