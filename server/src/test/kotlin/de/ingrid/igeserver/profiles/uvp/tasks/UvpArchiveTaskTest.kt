/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.utils.getString
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import java.time.LocalTime
import java.time.OffsetDateTime
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

@Sql(scripts = ["/test_data_uvp_archive.sql"], config = SqlConfig(encoding = "UTF-8"))
class UvpArchiveTaskTest : IntegrationTest() {

    @Autowired
    private lateinit var uvpArchiveTask: UvpArchiveTask

    @Autowired
    private lateinit var entityManager: EntityManager

    private lateinit var jobExecutionContext: JobExecutionContext

    private val expectedDate = getCompareDate()

    @BeforeEach
    fun setUp() {
        jobExecutionContext = mockk<JobExecutionContext>()
    }

    @Test
    fun `archive datasets with option HIDE_ALL`() {
        runWithOption(ArchiveType.HIDE_ALL)

        val steps = getProcessingStepsFrom(1001)

        getTableRows(steps, 0, "announcementDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 0, "applicationDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 0, "reportsRecommendationDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 0, "furtherDocs").forEach { it.getString("validUntil") shouldBe expectedDate }

        getTableRows(steps, 1, "considerationDocs").forEach { it.getString("validUntil") shouldBe expectedDate }

        getTableRows(steps, 2, "approvalDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 2, "decisionDocs").forEach { it.getString("validUntil") shouldBe expectedDate }

        checkIfArchived(1)
    }

    @Test
    fun `archive datasets with option SHOW_ONLY_DECISION`() {
        runWithOption(ArchiveType.SHOW_ONLY_DECISION)

        val steps = getProcessingStepsFrom(1001)

        getTableRows(steps, 0, "announcementDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 0, "applicationDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 0, "reportsRecommendationDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 0, "furtherDocs").forEach { it.getString("validUntil") shouldBe expectedDate }

        getTableRows(steps, 1, "considerationDocs").forEach { it.getString("validUntil") shouldBe expectedDate }

        getTableRows(steps, 2, "approvalDocs").forEach { it.getString("validUntil") shouldBe expectedDate }
        getTableRows(steps, 2, "decisionDocs").forEach { it.getString("validUntil") shouldBe null }

        checkIfArchived(1)
    }

    @Test
    fun `archive datasets with option SHOW_ALL`() {
        runWithOption(ArchiveType.SHOW_ALL)

        val steps = getProcessingStepsFrom(1001)

        getTableRows(steps, 0, "announcementDocs").forEach { it.getString("validUntil") shouldBe null }
        getTableRows(steps, 0, "applicationDocs").forEach { it.getString("validUntil") shouldBe null }
        getTableRows(steps, 0, "reportsRecommendationDocs").forEach { it.getString("validUntil") shouldBe null }
        getTableRows(steps, 0, "furtherDocs").forEach { it.getString("validUntil") shouldBe null }

        getTableRows(steps, 1, "considerationDocs").forEach { it.getString("validUntil") shouldBe null }

        getTableRows(steps, 2, "approvalDocs").forEach { it.getString("validUntil") shouldBe null }
        getTableRows(steps, 2, "decisionDocs").forEach { it.getString("validUntil") shouldBe null }

        checkIfArchived(1)
    }

    @Test @Ignore
    fun `do not set valid date for those already in the past`() {
        // TODO: set past date to a table entry

        runWithOption(ArchiveType.HIDE_ALL)

        val steps = getProcessingStepsFrom(1001)

        getTableRows(steps, 0, "announcementDocs").forEach { it.getString("validUntil") shouldBe null }
    }

    @Test @Ignore
    fun `set valid date for those in the future`() {
        // TODO: set future date to a table entry

        runWithOption(ArchiveType.HIDE_ALL)

        val steps = getProcessingStepsFrom(1001)

        getTableRows(steps, 0, "announcementDocs").forEach { it.getString("validUntil") shouldBe null }
    }

    private fun getTableRows(steps: ArrayNode, section: Int, tableId: String): ArrayNode = steps.get(section).get(tableId) as ArrayNode

    private fun getCompareDate(): String {
        return OffsetDateTime.now(ZoneId.of("Europe/Berlin"))
            .with(LocalTime.MIN) // Sets the time to the start of the day
            .withOffsetSameInstant(ZoneOffset.UTC) // Adjusts the offset to UTC
            .format(DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss.SSSXXX")) // Formats with milliseconds
    }

    private fun runWithOption(option: ArchiveType) {
        val jobDataMap = JobDataMap().apply {
            put("type", option.name)
            put("date", OffsetDateTime.now().toString())
            put("catalogId", "uvp_catalog")
        }
        every { jobExecutionContext.mergedJobDataMap } returns jobDataMap

        uvpArchiveTask.run(jobExecutionContext)
    }

    @Suppress("UNCHECKED_CAST")
    private fun getProcessingStepsFrom(id: Int): ArrayNode {
        val steps: List<ArrayNode> =
            entityManager.createNativeQuery(
                "SELECT data->'processingSteps' FROM document WHERE id=$id",
                JsonNode::class.java,
            ).resultList as List<ArrayNode>
        return steps[0]
    }

    @Suppress("UNCHECKED_CAST")
    private fun checkIfArchived(id: Int) {
        val entry = entityManager.createNativeQuery(
            "SELECT tags FROM document_wrapper WHERE id=$id",
            List::class.java,
        ).singleResult as List<String>

        entry.size shouldBe 1
        entry[0] shouldBe listOf("archived")
    }
}
