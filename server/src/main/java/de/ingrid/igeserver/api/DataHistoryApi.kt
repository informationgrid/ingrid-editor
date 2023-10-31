package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.DataHistoryRecord
import de.ingrid.igeserver.model.SearchResult
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.responses.ApiResponse
import io.swagger.v3.oas.annotations.responses.ApiResponses
import io.swagger.v3.oas.annotations.tags.Tag
import org.springframework.format.annotation.DateTimeFormat
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.*
import java.security.Principal
import java.time.LocalDate

@Hidden
@Tag(name = "DataHistory", description = "the data history API")
interface DataHistoryApi {
    @GetMapping(value = ["/data-history"], produces = [MediaType.APPLICATION_JSON_VALUE])
    @Operation(description = "Get the previous versions of datasets which match the given parameters. The results can also be sorted.")
    @ApiResponses(value = [ApiResponse(responseCode = "200", description = "Datasets found")])
    fun find(
            principal: Principal,
            @Parameter(description = "Restrict the result to versions of the dataset with the specified id.") @RequestParam(value = "id", required = false) id: String?,
            @Parameter(description = "Restrict the result to versions created by the specified user.") @RequestParam(value = "user", required = false) user: String?,
            @Parameter(description = "Restrict the result to versions created by the specified action.") @RequestParam(value = "action", required = false) action: String?,
            @Parameter(description = "Restrict the result to versions created after (and including) the specified date.") @RequestParam(value = "from", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) from: LocalDate?,
            @Parameter(description = "Restrict the result to versions created before (and including) the specified date.") @RequestParam(value = "to", required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) to: LocalDate?,
            @Parameter(description = "Sort by a given field.") @RequestParam(value = "sort", required = false) sort: String?,
            @Parameter(description = "Define the sort order.") @RequestParam(value = "sortOrder", required = false, defaultValue = "ASC") sortOrder: String?
        ): ResponseEntity<SearchResult<DataHistoryRecord>>
}