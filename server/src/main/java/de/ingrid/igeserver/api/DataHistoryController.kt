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

import de.ingrid.igeserver.model.DataHistoryRecord
import de.ingrid.igeserver.model.SearchResult
import de.ingrid.igeserver.persistence.filter.persistence.PostDataHistoryLogger
import de.ingrid.igeserver.services.AuditLogger
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal
import java.time.LocalDate
import java.time.OffsetDateTime

@RestController
@RequestMapping(path = ["/api"])
class DataHistoryController(private val auditLogger: AuditLogger) : DataHistoryApi {

    /**
     * Find dataset versions.
     */
    override fun find(
        principal: Principal,
        id: String?,
        user: String?,
        action: String?,
        from: LocalDate?,
        to: LocalDate?,
        sort: String?,
        sortOrder: String?
    ): ResponseEntity<SearchResult<DataHistoryRecord>> {

        val records = auditLogger.find(PostDataHistoryLogger.LOGGER_NAME, id, user, action, from, to, sort, sortOrder)
        val searchResult = SearchResult<DataHistoryRecord>()
        searchResult.totalHits = records.totalHits
        searchResult.hits = records.hits.map { record ->
            val message = record.message!!
//            dbService.removeInternalFields(message.data)
            DataHistoryRecord(
                id = message.target!!,
                actor = message.actor!!,
                action = message.action!!,
                time = OffsetDateTime.parse(message.time),
                data = message.data
            )
        }
        return ResponseEntity.ok(searchResult)
    }
}
