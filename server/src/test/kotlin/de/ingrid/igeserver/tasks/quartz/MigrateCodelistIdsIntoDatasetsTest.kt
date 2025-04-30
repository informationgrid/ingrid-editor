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
import org.quartz.JobDataMap
import org.quartz.JobExecutionContext
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig

@Sql(scripts = ["/test_data-codelist.sql"], config = SqlConfig(encoding = "UTF-8"))
class MigrateCodelistIdsIntoDatasetsTest : IntegrationTest() {

    @Autowired
    private lateinit var migrationTask: MigrateCodelistIdsIntoDatasets

    @Autowired
    private lateinit var entityManager: EntityManager

    private val codelistHandler = mockk<CodelistHandler>()

    private lateinit var jobExecutionContext: JobExecutionContext

    @BeforeEach
    fun setUp() {
        jobExecutionContext = mockk<JobExecutionContext>()

        // Setup mock JobDataMap
        val jobDataMap = JobDataMap().apply {
            put("catalogId", "test_catalog")
        }
        every { jobExecutionContext.mergedJobDataMap } returns jobDataMap
        every { jobExecutionContext.jobDetail.jobDataMap } returns JobDataMap()

        mockCodelists(codelistHandler)
    }

    @Test
    fun `migrate codelist ids inside document`() {
        migrationTask.run(jobExecutionContext)

        entityManager.createNativeQuery(
            "SELECT data FROM document WHERE id = 1001",
            JsonNode::class.java,
        ).resultList.first()
            .let {
                it as JsonNode
                println(it)
                it.get("themes").get(0).getString("_codelistId") shouldBe "6100"
                it.get("advProductGroups").get(0).getString("_codelistId") shouldBe "8010"
                it.getPath("service.version")!!.get(0).getString("_codelistId") shouldBe "5152"
                it.getPath("service.operations")!!.get(0).getString("name._codelistId") shouldBe "5110"
                it.getPath("service.classification")!!.get(0).getString("_codelistId") shouldBe "5200"
                it.getPath("spatial.spatialSystems")!!.get(0).getString("_codelistId") shouldBe "100"
                it.getString("service.type._codelistId") shouldBe "5100"
                it.getString("spatial.verticalExtent.Datum._codelistId") shouldBe "101"
                it.getString("spatial.verticalExtent.unitOfMeasure._codelistId") shouldBe "102"
                it.getString("metadata.language._codelistId") shouldBe "99999999"
                it.getPath("resource.useConstraints")!!.get(0).getString("title._codelistId") shouldBe "6500"
                it.getPath("resource.accessConstraints")!!.get(0).getString("_codelistId") shouldBe "6010"
                it.getPath("temporal.events")!!.get(0).getString("referenceDateType._codelistId") shouldBe "502"
                it.getString("temporal.status._codelistId") shouldBe "523"
//                it.getString("temporal.resourceDateType._codelistId") shouldBe "???"
                it.getPath("references")!!.get(0).getString("type._codelistId") shouldBe "2000"
                it.getPath("references")!!.get(0).getString("urlDataType._codelistId") shouldBe "1320"
                it.getPath("distribution.format")!!.get(0).getString("name._codelistId") shouldBe "1320"
                it.getString("spatialScope._codelistId") shouldBe "6360"
                it.getPath("pointOfContact")!!.get(0).getString("type._codelistId") shouldBe "505"
                it.getPath("pointOfContact")!!.get(1).getString("type._codelistId") shouldBe "505"
                it.getPath("priorityDatasets")!!.get(0).getString("_codelistId") shouldBe "6350"
                it.getPath("conformanceResult")!!.get(0).getString("pass._codelistId") shouldBe "6000"
                it.getPath("conformanceResult")!!.get(0).getString("specification._codelistId") shouldBe "6005"
                it.getPath("digitalTransferOptions")!!.get(0).getString("name._codelistId") shouldBe "520"
//                it.getPath("digitalTransferOptions")!!.get(0).getString("transferSize.unit._codelistId") shouldBe "???"
                it.getString("maintenanceInformation.maintenanceAndUpdateFrequency._codelistId") shouldBe "518"
                it.getString("maintenanceInformation.userDefinedMaintenanceFrequency.unit._codelistId") shouldBe "1230"
                it.getPath("extraInfo.legalBasicsDescriptions")!!.get(0).getString("_codelistId") shouldBe "1350"
            }
    }
}
