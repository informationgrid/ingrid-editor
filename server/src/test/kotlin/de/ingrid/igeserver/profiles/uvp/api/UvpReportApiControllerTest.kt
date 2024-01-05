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
package de.ingrid.igeserver.profiles.uvp.api

import IntegrationTest
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import org.hamcrest.Matchers.`is`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.PlatformTransactionManager


@Sql(scripts = ["/uvp/test_data_uvp-report.sql"], config = SqlConfig(encoding = "UTF-8"))
class UvpReportApiControllerTest : IntegrationTest() {

    val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true)

    @Autowired
    lateinit var mockMvc: MockMvc

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var transactionManager: PlatformTransactionManager

    @Before
    fun beforeTest() {
        every {
            mockPrincipal.authorities
        }.returns(listOf(SimpleGrantedAuthority("cat-admin")))
        every {
            mockPrincipal.principal
        }.returns("user1")
    }

    @Test
    fun getEiaNumberStatistics() {
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(3)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 2))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("32", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(4))))
    }

    @Test
    fun negativeTest() {
        execSQL("/uvp/test_data_uvp-report_addNegative.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(3)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 2))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("32", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(4))))
    }

    @Test
    fun addDraftsShouldNotChangeAnything() {
        execSQL("/uvp/test_data_uvp-report_addDrafts.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(3)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 2))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("32", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(4))))
    }

    @Test
    fun addPublishedVersionsShouldModifyReport() {
        execSQL("/uvp/test_data_uvp-report_addPublished.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(3)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 3))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("32", 2))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(2)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(6))))
    }

    @Test
    fun multipleStepsShouldGetMaxDecisionDate() {
        execSQL("/uvp/test_data_uvp-report_multipleSteps.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(3)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 3))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("32", 2))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(5))))
    }

    @Test
    fun filterByStartDate() {
        mockMvc.perform(get("/api/uvp/report?from=2022-10-08T22:00:00.000Z").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(2)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("6", 1))))
//            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("32", 2))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(5))))
    }

    @Test
    fun filterByEndDate() {
        mockMvc.perform(get("/api/uvp/report?to=2022-10-07T22:00:00.000Z").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(2)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("32", 1))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("6", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(3))))
    }

    @Test
    fun filterByStartAndEndDate() {
        mockMvc.perform(
            get("/api/uvp/report?from=2022-10-08T22:00:00.000Z&to=2022-10-10T22:00:00.000Z").principal(
                mockPrincipal
            )
        )
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(2)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("6", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(5))))
    }

    @Test
    fun filterByStartAndEndDateAndMultipleDecisionDates() {
        execSQL("/uvp/test_data_uvp-report_startEndMultipleDecisionDates.sql")
        mockMvc.perform(
            get("/api/uvp/report?from=2021-10-09T22:00:00.000Z&to=2021-10-10T22:00:00.000Z").principal(
                mockPrincipal
            )
        )
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(1)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("10", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(7))))
    }

    @Test
    fun filterByStartAndEndDateAndMissingReceiptDate() {
        execSQL("/uvp/test_data_uvp-report_addPublishedWithoutReceiptDate.sql")
        mockMvc.perform(
            get("/api/uvp/report?from=2022-01-22T23:00:00.000Z&to=2022-01-22T23:00:00.000Z").principal(
                mockPrincipal
            )
        )
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic.length()", `is`(1)))
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("8", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(17))))
    }


    private fun execSQL(sqlFile: String) {
        val sql = {}.javaClass.getResource(sqlFile)?.readText()!!
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql)
                .executeUpdate()
        }
    }

    private fun daysInSeconds(days: Int) = days * 60 * 60 * 24

}
