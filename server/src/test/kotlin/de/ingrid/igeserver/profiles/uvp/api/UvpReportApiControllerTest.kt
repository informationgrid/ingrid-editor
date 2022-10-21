package de.ingrid.igeserver.profiles.uvp.api

import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.extensions.spring.SpringExtension
import io.mockk.every
import io.mockk.mockk
import org.hamcrest.Matchers.`is`
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.PlatformTransactionManager
import javax.persistence.EntityManager


@SpringBootTest(classes = [IgeServer::class], webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = ["/uvp/test_data_uvp-report.sql"], config = SqlConfig(encoding = "UTF-8"))
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles(profiles = ["uvp"])
class UvpReportApiControllerTest @Autowired constructor(
    val mockMvc: MockMvc,
    @MockkBean(relaxed = true) val mockCatalogService: CatalogService,
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager
) : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)
    val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true)

    @Before
    fun beforeTest() {
        every {
            mockCatalogService.getPermissions(any())
        }.returns(listOf("can_create_uvp_report"))
        every {
            mockCatalogService.getCatalogById(any())
        }.returns(Catalog().apply { id = 100 })
        every {
            mockCatalogService.getCurrentCatalogForPrincipal(any())
        }.returns("test_catalog")

        every {
            mockPrincipal.authorities
        }.returns(listOf(SimpleGrantedAuthority("cat-admin")))
        every {
            mockPrincipal.principal
        }.returns("tester")
    }

    @Test
    fun getEiaNumberStatistics() {
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 2))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("32", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(4))))
    }

    private fun daysInSeconds(days: Int) = days * 60 * 60 * 24

    @Test
    fun negativeTest() {
        execSQL("/uvp/test_data_uvp-report_addNegative.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 2))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("32", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(4))))
    }

    @Test
    fun addDraftsShouldNotChangeAnything() {
        execSQL("/uvp/test_data_uvp-report_addDrafts.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 2))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("32", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(4))))
    }

    @Test
    fun addPublishedVersionsShouldModifyReport() {
        execSQL("/uvp/test_data_uvp-report_addPublished.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 3))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("32", 2))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(1)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(6))))
    }

    @Test
    fun multipleStepsShouldGetMaxDecisionDate() {
        execSQL("/uvp/test_data_uvp-report_multipleSteps.sql")
        mockMvc.perform(get("/api/uvp/report").principal(mockPrincipal))
            .andDo(print())
            .andExpect(status().isOk)
            .andExpect(jsonPath("$.eiaStatistic[0]", `is`(listOf("6", 3))))
            .andExpect(jsonPath("$.eiaStatistic[1]", `is`(listOf("32", 2))))
            .andExpect(jsonPath("$.eiaStatistic[2]", `is`(listOf("3", 1))))
            .andExpect(jsonPath("$.negativePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.positivePreliminaryAssessments", `is`(0)))
            .andExpect(jsonPath("$.averageProcedureDuration", `is`(daysInSeconds(5))))
    }


    private fun execSQL(sqlFile: String) {
        val sql = {}.javaClass.getResource(sqlFile)?.readText()!!
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql)
                .executeUpdate()
        }
    }

}
