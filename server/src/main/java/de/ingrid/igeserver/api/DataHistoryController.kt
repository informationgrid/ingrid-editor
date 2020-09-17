package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.model.DataHistoryRecord
import de.ingrid.igeserver.model.SearchResult
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.services.AuditLogger
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.LocalDate
import java.time.OffsetDateTime

@RestController
@RequestMapping(path = ["/api"])
class DataHistoryController(private val auditLogger: AuditLogger) : DataHistoryApi {

    private val log = logger()

    @Value("\${audit.log.data-history-logger:audit.data-history}")
    private var historyLogger: String? = null

    @Autowired
    private lateinit var dbService: DBApi

    /**
     * Find dataset versions.
     */
    override fun find(
            principal: Principal?,
            id: String?,
            user: String?,
            action: String?,
            from: LocalDate?,
            to: LocalDate?,
            sort: String?,
            sortOrder: String?
        ): ResponseEntity<SearchResult<DataHistoryRecord>> {

        val records = auditLogger.find(historyLogger, id, user, action, from, to, sort, sortOrder)
        val searchResult = SearchResult<DataHistoryRecord>()
        searchResult.totalHits = records.totalHits
        searchResult.hits = records.hits.map { record: JsonNode ->
            val message = record["message"]
            dbService.removeInternalFields(message["data"])
            DataHistoryRecord(
                    id = message["target"].asText(),
                    actor = message["actor"].asText(),
                    action = message["action"].asText(),
                    time = OffsetDateTime.parse(message["time"].asText()),
                    data = message["data"])
        }
        return ResponseEntity.ok(searchResult)
    }
}