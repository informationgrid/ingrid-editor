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

import de.ingrid.igeserver.imports.ImportService
import de.ingrid.igeserver.imports.ImportTypeInfo
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
class ImportApiController(
    private val importService: ImportService,
    private val catalogService: CatalogService
) : ImportApi {

    private val log = logger()
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
    // so far we always want to overwrite datasets
    val overwriteDatasets: Boolean = true)
