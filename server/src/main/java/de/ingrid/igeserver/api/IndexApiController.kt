package de.ingrid.igeserver.api

import de.ingrid.igeserver.index.IndexOptions
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.IndexRequestOptions
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.FIELD_CATEGORY
import de.ingrid.igeserver.services.FIELD_PUBLISHED
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class IndexApiController @Autowired constructor(private val catalogService: CatalogService, private val dbService: DBApi, private val indexService: IndexService, private val indexingTask: IndexingTask) : IndexApi {
    override fun startIndexing(principal: Principal?, options: IndexRequestOptions): ResponseEntity<Void> {

        indexingTask.startIndexing(options.catalogId, options.format)

        return ResponseEntity.ok().build()
    }

    override fun setConfig(principal: Principal?, config: IndexConfigOptions): ResponseEntity<Void> {

        dbService.acquire(config.catalogId).use {
            indexService.updateConfig(config.cronPattern)
            indexingTask.updateTaskTrigger(config.catalogId, config.cronPattern)
        }

        return ResponseEntity.ok().build()
    }

    override fun getConfig(principal: Principal?, id: String): ResponseEntity<IndexConfigOptions> {

        dbService.acquire(id).use {
            return ResponseEntity.ok(IndexConfigOptions(id, indexService.getConfig() ?: ""))
        }

    }
}
