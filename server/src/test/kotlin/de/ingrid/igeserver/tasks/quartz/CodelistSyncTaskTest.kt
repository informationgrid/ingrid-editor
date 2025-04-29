/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.tasks.quartz

import IntegrationTest
import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import mockCodelists
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig

@Sql(scripts = ["/test_data-codelist.sql"], config = SqlConfig(encoding = "UTF-8"))
class CodelistSyncTaskTest : IntegrationTest() {

    @Autowired
    private lateinit var codelistSyncTask: CodelistSyncTask

    @Autowired
    private lateinit var entityManager: EntityManager

    private val codelistHandler = mockk<CodelistHandler>()

    private lateinit var jobExecutionContext: JobExecutionContext

//    @SpykBean
//    private lateinit var jdbcTemplate: JdbcTemplate

    @BeforeEach
    fun setUp() {
        jobExecutionContext = mockk<JobExecutionContext>()

        // Setup mock JobDataMap
        val jobDataMap = JobDataMap().apply {
            put("catalogId", "test_catalog")
        }
        every { jobExecutionContext.mergedJobDataMap } returns jobDataMap
        every { jobExecutionContext.jobDetail.jobDataMap } returns JobDataMap()

        // Mock jdbcTemplate.update to return 1 (1 row updated)
//        every { jdbcTemplate.update(any() as String) } returns 1

        mockCodelists(codelistHandler)
    }

    @Test
    fun `test successful execution`() {
        // Execute the task
        codelistSyncTask.run(jobExecutionContext)

        // Verify that each call to jdbcTemplate.update returns 1 updated row
        /*verify(exactly = 27) {
            val result = jdbcTemplate.update(any() as String)
            assert(result == 1) { "Expected sql result to return 1 updated rows, but got $result" }
        }*/

        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1001",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.get("themes").get(0).getString("value") shouldBe "Biogeografische Regionen"
                it.get("advProductGroups").get(0).getString("value") shouldBe "Digitale Orthophotos"
                it.getPath("service.version")!!.get(0).getString("value") shouldBe "OGC:WMS 1.3.0"
                it.getPath("service.operations")!!.get(0).getString("name.value") shouldBe "GetMap"
                it.getPath("service.classification")!!.get(0).getString("value") shouldBe "Abonnementdienst"
                it.getPath("spatial.spatialSystems")!!.get(0).getString("value") shouldBe "CRS 84: CRS 84 / mathematisch"
                it.getString("service.type.value") shouldBe "Download-Dienste"
                it.getString("spatial.verticalExtent.Datum.value") shouldBe "DE_AMST / NH"
                it.getString("spatial.verticalExtent.unitOfMeasure.value") shouldBe "Kilometer"
                it.getString("metadata.language.value") shouldBe "Deutsch"
                it.getPath("resource.useConstraints")!!.get(0).getString("title.value") shouldBe "Amtliches Werk, lizenzfrei nach §5 Abs. 1 UrhG"
                it.getPath("resource.accessConstraints")!!.get(0).getString("value") shouldBe "aufgrund der Vertraulichkeit der Verfahren von Behörden"
                it.getPath("temporal.events")!!.get(0).getString("referenceDateType.value") shouldBe "Erstellung"
                it.getString("temporal.status.value") shouldBe "erforderlich"
//                it.getString("temporal.resourceDateType.value") shouldBe "???"
                it.getPath("references")!!.get(0).getString("type.value") shouldBe "Datendownload"
                it.getPath("references")!!.get(0).getString("urlDataType.value") shouldBe "GeoTIFF"
                it.getPath("distribution.format")!!.get(0).getString("name.value") shouldBe "ASCII"
                it.getString("spatialScope.value") shouldBe "Global"
                it.getPath("pointOfContact")!!.get(0).getString("type.value") shouldBe "Ansprechpartner MD"
                it.getPath("pointOfContact")!!.get(1).getString("type.value") shouldBe "Ansprechpartner"
                it.getPath("priorityDatasets")!!.get(0).getString("value") shouldBe "Agglomerations - aircraft noise exposure delineation (day)"
                it.getPath("conformanceResult")!!.get(0).getString("pass.value") shouldBe "konform"
                it.getPath("conformanceResult")!!.get(0).getString("specification.value") shouldBe "VERORDNUNG (EG) Nr. 976/2009 - INSPIRE Durchführungsbestimmung Netzdienste"
                it.getPath("digitalTransferOptions")!!.get(0).getString("name.value") shouldBe "3,5-Zoll Diskette"
//                it.getPath("digitalTransferOptions")!!.get(0).getString("transferSize.unit.value") shouldBe "???"
                it.getString("maintenanceInformation.maintenanceAndUpdateFrequency.value") shouldBe "einmalig"
                it.getString("maintenanceInformation.userDefinedMaintenanceFrequency.unit.value") shouldBe "Monate"
                it.getPath("spatial.spatialSystems")!!.get(0).getString("value") shouldBe "CRS 84: CRS 84 / mathematisch"
                it.getPath("resource.accessConstraints")!!.get(0).getString("value") shouldBe "aufgrund der Vertraulichkeit der Verfahren von Behörden"
                it.getPath("extraInfo.legalBasicsDescriptions")!!.get(0).getString("value") shouldBe "§ 67 NWG"
            }
    }

//    @Test
    /*
        fun `test error handling`() {
            // Execute the task - it should handle the exception and continue
            codelistSyncTask.run(jobExecutionContext)

            // Verify that getCodelists was called with the expected parameters
            verify(exactly = 28) { codelistHandler.getCodelists(any()) }

            // Verify that each call to jdbcTemplate.update returns 1 (1 row updated)
            // This ensures the log message contains "Updated 1 rows"
            verify {
                val result = jdbcTemplate.update(any() as String)
                assert(result == 1) { "Expected jdbcTemplate.update to return 1 (Updated 1 rows), but got $result" }
            }
        }
     */
}
