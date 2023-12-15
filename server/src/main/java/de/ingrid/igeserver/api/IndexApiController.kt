/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.IndexRequestOptions
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@Profile("elasticsearch")
@RestController
@RequestMapping(path = ["/api"])
class IndexApiController(
    private val catalogService: CatalogService,
    private val indexService: IndexService,
    private val indexingTask: IndexingTask
) : IndexApi {
    override fun startIndexing(principal: Principal, options: IndexRequestOptions): ResponseEntity<Void> {

        indexingTask.indexByScheduler(options.catalogId, options.format)

        return ResponseEntity.ok().build()
    }

    override fun cancelIndexing(principal: Principal, catalogId: String): ResponseEntity<Void> {

        indexingTask.cancelIndexing(catalogId)

        return ResponseEntity.ok().build()

    }

    override fun setConfig(principal: Principal, config: IndexConfigOptions): ResponseEntity<Void> {

        indexService.updateConfig(config)
        indexingTask.updateTaskTrigger(config)

        return ResponseEntity.ok().build()
    }

    override fun getConfig(principal: Principal, catalogId: String): ResponseEntity<IndexConfigOptions> {

        val catalog = catalogService.getCatalogById(catalogId)
        val profile = catalogService.getProfileFromCatalog(catalogId)
        return ResponseEntity.ok(IndexConfigOptions(catalogId, catalog.settings?.indexCronPattern ?: "", profile.indexExportFormatID ?: ""))

    }

    override fun getLog(principal: Principal): ResponseEntity<IndexMessage> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val message = indexService.getLastLog(catalogId)

        return ResponseEntity.ok(message)
    }
}
