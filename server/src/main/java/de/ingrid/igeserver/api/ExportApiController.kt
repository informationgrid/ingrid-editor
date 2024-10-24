/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.model.ExportRequestParameter
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.ExportService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpHeaders.CONTENT_DISPOSITION
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

    override fun export(principal: Principal, options: ExportRequestParameter): ResponseEntity<ByteArray?> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val exportResult = exportService.export(catalogId, options)

        return ResponseEntity.ok()
            .header(CONTENT_DISPOSITION, "attachment;filename=\"${exportResult.fileName}\"")
            .contentType(exportResult.exportFormat)
            .body(exportResult.result)
    }

    override fun exportTypes(principal: Principal, profile: String, onlyPublic: Boolean): ResponseEntity<List<ExportTypeInfo>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        return ResponseEntity.ok(exportService.getExportTypes(catalogId, profile, onlyPublic))
    }
}
