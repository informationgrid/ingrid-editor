package de.ingrid.igeserver.api

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.ExportService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class ExportApiController : ExportApi {
    @Autowired
    private lateinit var exportService: ExportService

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun export(principal: Principal, data: ExportRequestParameter): ResponseEntity<ByteArray?> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val result = exportService.export(catalogId, data)

        return ResponseEntity.ok(result)
    }

    override fun exportTypes(principal: Principal, profile: String): ResponseEntity<List<ExportTypeInfo>> {
        return ResponseEntity.ok(exportService.getExportTypes(profile))
    }
}
