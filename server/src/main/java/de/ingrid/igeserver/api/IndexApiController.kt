package de.ingrid.igeserver.api

import de.ingrid.igeserver.index.IndexService
import de.ingrid.igeserver.model.IndexConfigOptions
import de.ingrid.igeserver.model.IndexRequestOptions
import de.ingrid.igeserver.model.LogResponse
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

    override fun getLog(principal: Principal?): ResponseEntity<LogResponse> {

        val log = listOf(
            "Logzeile 1",
            "Logzeile 2",
            "Logzeile 3",
            "Logzeile 4",
            "Logzeile 5",
            "Logzeile 6",
            "Logzeile 7",
            "Logzeile 8",
            "Logzeile 9",
            "Logzeile 10",
            "Logzeile 11",
            "Logzeile 12",
            "Logzeile 13",
            "Logzeile 14",
            "Logzeile 15",
            "Logzeile 16",
            "Logzeile 17",
            "Logzeile 18",
            "Logzeile 19",
            "Logzeile 20"
        )

        return ResponseEntity.ok(LogResponse(OffsetDateTime.now(), log))
    }
}
