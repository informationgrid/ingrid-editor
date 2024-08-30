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

import de.ingrid.igeserver.api.messaging.UrlReport
import de.ingrid.igeserver.model.Job
import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.model.JobInfo
import io.swagger.v3.oas.annotations.Hidden
import io.swagger.v3.oas.annotations.Parameter
import io.swagger.v3.oas.annotations.tags.Tag
import jakarta.validation.Valid
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PathVariable
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestParam
import org.springframework.web.multipart.MultipartFile
import java.security.Principal

data class UrlReplaceData(val source: UrlReport, val replaceUrl: String)

@Hidden
@Tag(name = "Jobs", description = "the jobs API")
interface JobsApi {

    @GetMapping(
        value = ["/jobs"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun getJobs(
        principal: Principal,
    ): ResponseEntity<Job>

    @GetMapping(
        value = ["/jobs/{id}/is-running"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun isRunning(
        principal: Principal,
        @Parameter(description = "The ID of the job.", required = true) @PathVariable("id") id: String,
    ): ResponseEntity<Boolean>

    @GetMapping(
        value = ["/jobs/{id}/info"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun getInfo(
        principal: Principal,
        @Parameter(description = "The ID of the job.", required = true) @PathVariable("id") id: String,
    ): ResponseEntity<JobInfo>

    @PostMapping(
        value = ["/jobs/url-check"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun urlCheckTask(
        principal: Principal,
        @Parameter(description = "command for the job", required = true) @RequestParam(
            value = "command",
            required = true,
        ) command: JobCommand,
    ): ResponseEntity<Unit>

    @PostMapping(
        value = ["/jobs/import/analyze"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun importAnalyzeTask(
        principal: Principal,
        @Parameter(
            description = "The dataset to be imported.",
            required = true,
        ) @RequestBody file: @Valid MultipartFile,
        @Parameter(description = "command for the job", required = true) @RequestParam(
            value = "command",
            required = true,
        ) command: JobCommand,
    ): ResponseEntity<Unit>

    @PostMapping(
        value = ["/jobs/import"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun importTask(
        principal: Principal,
        @Parameter(description = "command for the job", required = true) @RequestParam(
            value = "command",
            required = true,
        ) command: JobCommand,
        @Parameter(required = true) @RequestBody(
            required = true,
        ) options: ImportOptions,
    ): ResponseEntity<Unit>

    @PostMapping(
        value = ["/jobs/url-check/replace"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun replaceUrl(
        principal: Principal,
        @Parameter(description = "command for the job", required = true) @RequestBody(
            required = true,
        ) data: UrlReplaceData,
    ): ResponseEntity<Map<String, Any>>

    @PostMapping(
        value = ["/jobs/cleanup-uploads"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun cleanupUploads(principal: Principal): ResponseEntity<Unit>

    @PostMapping(
        value = ["/jobs/remove-unreferenced-documents"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun removeUnreferencedDocuments(principal: Principal): ResponseEntity<List<String>>

    @PostMapping(
        value = ["/jobs/update-external-coupled-resources"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun updateExternalCoupledResources(principal: Principal): ResponseEntity<String>

    @PostMapping(
        value = ["/jobs/index"],
        produces = [MediaType.APPLICATION_JSON_VALUE],
    )
    fun indexCatalog(principal: Principal, command: JobCommand): ResponseEntity<Unit>
}
