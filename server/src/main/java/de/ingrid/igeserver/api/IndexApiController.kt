package de.ingrid.igeserver.api

import de.ingrid.igeserver.api.messaging.IndexMessage
import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.IndexRequestOptions
import de.ingrid.igeserver.model.LogResponse
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.OffsetDateTime

@Profile("elasticsearch")
@RestController
@RequestMapping(path = ["/api"])
class IndexApiController @Autowired constructor(
    private val catalogService: CatalogService,
    private val indexService: IndexService,
    private val indexingTask: IndexingTask
) : IndexApi {
    override fun startIndexing(principal: Principal?, options: IndexRequestOptions): ResponseEntity<Void> {

        indexingTask.startIndexing(options.catalogId, options.format)

        return ResponseEntity.ok().build()
    }

    override fun setConfig(principal: Principal?, config: IndexConfigOptions): ResponseEntity<Void> {

        indexService.updateConfig(config.catalogId, config.cronPattern)
        indexingTask.updateTaskTrigger(config.catalogId, config.cronPattern)

        return ResponseEntity.ok().build()
    }

    override fun getConfig(principal: Principal?, id: String): ResponseEntity<IndexConfigOptions> {

        return ResponseEntity.ok(IndexConfigOptions(id, indexService.getConfig(id) ?: ""))

    }

    override fun getLog(principal: Principal?): ResponseEntity<IndexMessage> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val message = indexService.getLastLog(catalogId)

        return ResponseEntity.ok(message)
    }
}
