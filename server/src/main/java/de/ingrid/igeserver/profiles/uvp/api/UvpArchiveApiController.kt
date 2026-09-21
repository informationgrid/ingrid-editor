/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.api

import de.ingrid.igeserver.model.JobCommand
import de.ingrid.igeserver.model.JobInfo
import de.ingrid.igeserver.profiles.uvp.UvpArchiveService
import de.ingrid.igeserver.profiles.uvp.tasks.UvpArchiveTask
import de.ingrid.igeserver.profiles.uvp.tasks.UvpAutomaticArchiveTask
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.SchedulerService
import io.swagger.v3.oas.annotations.Operation
import io.swagger.v3.oas.annotations.tags.Tag
import org.quartz.JobDataMap
import org.quartz.JobKey
import org.springframework.http.MediaType
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.PostMapping
import org.springframework.web.bind.annotation.RequestBody
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.security.Principal
import java.time.OffsetDateTime

@Tag(name = "UVP Archive")
@RestController
@RequestMapping(path = ["/api/uvp/archive"])
class UvpArchiveApiController(val catalogService: CatalogService, val scheduler: SchedulerService, val uvpArchiveService: UvpArchiveService) {

    @Operation
    @PostMapping(value = [""], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun archive(
        principal: Principal,
        @RequestBody body: ArchiveParameter,
    ): ResponseEntity<Boolean> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val jobKey = JobKey.jobKey(UvpArchiveTask.JOB_KEY, catalogId)

        val jobDataMap = JobDataMap().apply {
            put("catalogId", catalogId)
            put("date", body.date.toString())
            put("report", null)
        }
        scheduler.handleJobWithCommand(JobCommand.start, UvpArchiveTask::class.java, jobKey, jobDataMap)

        return ResponseEntity.ok(true)
    }

    @Operation
    @PostMapping(value = ["/check"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getDatasetsBeforeDecisionDate(
        principal: Principal,
        @RequestBody date: OffsetDateTime,
    ): ResponseEntity<Int> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val result = uvpArchiveService.getDatasetsBeforeDecisionDate(catalogId, date)
        return ResponseEntity.ok(result.size)
    }

    @Operation
    @GetMapping(value = ["/automatic/info"], produces = [MediaType.APPLICATION_JSON_VALUE])
    fun getAutomaticArchiveInfo(
        principal: Principal,
    ): ResponseEntity<JobInfo> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)
        val jobKey = JobKey.jobKey(UvpAutomaticArchiveTask.JOB_KEY, catalogId)
        val isRunning = scheduler.isRunning(jobKey)
        val jobDetail = scheduler.getJobInfo(jobKey)
        val jobDataMap = jobDetail?.jobDataMap?.let { map ->
            val mapper = jacksonObjectMapper()
            val resultDataMap = JobDataMap()

            resultDataMap["startTime"] = map["startTime"]
            resultDataMap["endTime"] = map["endTime"]
            resultDataMap["progress"] = map["progress"]
            map.getString("report")?.let {
                resultDataMap.put("report", mapper.readValue(it, Any::class.java))
            }
            map.getString("errors")?.let {
                resultDataMap.put("errors", mapper.readValue(it, List::class.java))
            }

            resultDataMap
        }
        return ResponseEntity.ok(JobInfo(isRunning, jobDataMap))
    }
}

data class ArchiveParameter(val date: OffsetDateTime?)
