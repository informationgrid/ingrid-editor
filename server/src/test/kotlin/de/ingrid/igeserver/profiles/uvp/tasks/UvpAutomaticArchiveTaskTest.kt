/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.tasks

import IntegrationTest
import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.profiles.uvp.api.UvpArchiveApiController
import de.ingrid.igeserver.profiles.uvp.messaging.ArchiveNotifier
import de.ingrid.igeserver.profiles.uvp.messaging.ArchivedDatasetInfo
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.SchedulerService
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.quartz.JobDataMap
import org.quartz.JobDetail
import org.quartz.JobExecutionContext
import org.quartz.JobKey
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import java.security.Principal

@Sql(scripts = ["/test_data_uvp_archive.sql"], config = SqlConfig(encoding = "UTF-8"))
class UvpAutomaticArchiveTaskTest : IntegrationTest() {

    @Autowired
    private lateinit var uvpAutomaticArchiveTask: UvpAutomaticArchiveTask

    @Autowired
    private lateinit var uvpArchiveApiController: UvpArchiveApiController

    @Autowired
    private lateinit var schedulerService: SchedulerService

    @Autowired
    private lateinit var schedulerFactoryBean: org.springframework.scheduling.quartz.SchedulerFactoryBean

    @MockkBean
    private lateinit var behaviourService: BehaviourService

    @MockkBean
    private lateinit var archiveNotifier: ArchiveNotifier

    private lateinit var jobExecutionContext: JobExecutionContext
    private lateinit var jobDetail: JobDetail
    private lateinit var jobDataMap: JobDataMap
    private val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true)

    @BeforeEach
    fun setUp() {
        jobDataMap = JobDataMap()
        jobDetail = mockk<JobDetail>(relaxed = true)
        every { jobDetail.jobDataMap } returns jobDataMap
        jobExecutionContext = mockk<JobExecutionContext>(relaxed = true)
        every { jobExecutionContext.jobDetail } returns jobDetail
        every { archiveNotifier.sendMessage(any()) } returns Unit

        every { mockPrincipal.authorities } returns listOf(SimpleGrantedAuthority("cat-admin"))
        every { mockPrincipal.principal } returns "user1"
    }

    @Test
    fun `automatic archive executes and records archived datasets report`() {
        every { behaviourService.getData("uvp_catalog", "plugin.uvp.archive") } returns mapOf(
            "automaticArchiveEnabled" to true,
            "archiveAfterMonths" to 1,
            "uvpArchiveType" to "showAll",
        )
        every { behaviourService.get("uvp_catalog", "plugin.archive")?.data?.get("showInPortal") } returns true
        every { behaviourService.get("uvp_catalog", "plugin.uvp.archive")?.data?.get("uvpArchiveType") } returns "showAll"

        uvpAutomaticArchiveTask.run(jobExecutionContext)

        jobDataMap.containsKey("uvp_catalog_report") shouldBe true
        val reportJson = jobDataMap.getString("uvp_catalog_report")
        reportJson.shouldNotBeNull()

        // Store job in scheduler
        val jobKey = JobKey.jobKey(UvpAutomaticArchiveTask.JOB_KEY, UvpAutomaticArchiveTask.JOB_GROUP)
        val jobDetail = org.quartz.JobBuilder.newJob(UvpAutomaticArchiveTask::class.java)
            .withIdentity(jobKey)
            .usingJobData(jobDataMap)
            .storeDurably()
            .build()
        schedulerFactoryBean.scheduler.addJob(jobDetail, true)

        val response = uvpArchiveApiController.getAutomaticArchiveInfo(mockPrincipal)
        response.body.shouldNotBeNull()
        val infoData = response.body?.info
        infoData.shouldNotBeNull()
        val report = infoData["report"] as? List<*>
        report.shouldNotBeNull()
        report.size shouldBe 2
    }
}
