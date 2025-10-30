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
package de.ingrid.igeserver.ogc

import IntegrationTest
import de.ingrid.igeserver.features.ogc_api_records.api.RecordFormat
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import org.hamcrest.Matchers.containsString
import org.hamcrest.Matchers.hasItems
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.ResultActions
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.jsonPath
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.PlatformTransactionManager
import java.nio.charset.StandardCharsets

@WithMockUser(username = "user1", authorities = ["cat-admin"])
@Sql(scripts = ["/ogc/data.sql"], config = SqlConfig(encoding = "UTF-8"))
class OgcRecordsTests : IntegrationTest() {

    val mockPrincipal = mockk<UsernamePasswordAuthenticationToken>(relaxed = true)

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    lateinit var mockMvc: MockMvc

    val collectionId = "test_catalog_ogc"
    val wrongCollectionId = "no-can-do"
    val recordId = "b08533dc-f3cd-46ea-a12e-d7f799d59330"
    val wrongRecordId = "wrong3dc-f3cd-46ea-a12e-d7f79invalid"
    val formats = listOf(RecordFormat.JSON, RecordFormat.GEOJSON, RecordFormat.HTML) // , RecordFormat.INGRID_ISO)

    @BeforeEach
    fun beforeTest() {
        every {
            mockPrincipal.authorities
        }.returns(listOf(SimpleGrantedAuthority("cat-admin")))
        every {
            mockPrincipal.principal
        }.returns("user1")
        every {
            mockPrincipal.isAuthenticated
        }.returns(true)

        SecurityContextHolder.getContext().authentication = mockPrincipal
    }

    @Test
    fun getCollection() {
        mockMvc.perform(get("/api/ogc/collections/$collectionId"))
            .andDo(print())
            .andExpect(status().isOk)
    }

    @Test
    fun getCollectionByWrongCollectionId() {
        mockMvc.perform(get("/api/ogc/collections/$wrongCollectionId"))
            .andDo(print())
            .andExpect(status().isNotFound)
//            .andExpect(MockMvcResultMatchers.jsonPath("$.errorText").value("Resource of type 'collection' with id '$wrongCollectionId' is missing."))
    }

    @Test
    fun getRecord() {
        for (format in formats) {
            mockMvc.perform(get("/api/ogc/collections/$collectionId/items/$recordId").param("f", format.name))
                .andDo(print())
                .andExpect(status().isOk)
        }
    }

    @Test
    fun getRecordByWrongRecordId() {
        mockMvc.perform(get("/api/ogc/collections/$collectionId/items/$wrongRecordId"))
            .andDo(print())
            .andExpect(status().isNotFound)
//            .andExpect(MockMvcResultMatchers.jsonPath("$.errorText").value("Resource of type 'null' with id '$wrongRecordId' is missing."))
    }

    @Test
    fun getRecordByWrongCollectionIdAndRightRecordId() {
        mockMvc.perform(get("/api/ogc/collections/$wrongCollectionId/items/$recordId"))
            .andDo(print())
            .andExpect(status().isNotFound)
//            .andExpect(MockMvcResultMatchers.jsonPath("$.errorText").value("Resource of type 'null' with id '$wrongRecordId' is missing."))
    }

//    @Test
//    fun getRecords() {
//        mockMvc.perform(get("/collections/$collectionId/items").principal(mockPrincipal))
//            .andDo(print())
//            .andExpect(status().isOk)
//    }

    private fun postRecord(collection: String, jsonPath: String): ResultActions {
        val json = resourceText(jsonPath)
        return mockMvc.perform(
            post("/api/ogc/collections/$collection/items")
                .contentType(MediaType.APPLICATION_JSON)
                .content(json)
                .principal(mockPrincipal),
        )
    }

    @Test
    fun ingridPostGeoDatasetMinimum() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geodatasetMinimumForPublish.json",
        ).andExpect(status().isCreated)
    }

    @Test
    fun ingridPostGeoServiceMinimum() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geoserviceMinimumForPublish.json",
        ).andExpect(status().isCreated)
    }

    @Test
    fun ingridPostGeoDatasetMissingFieldsOfIsOpenData() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geodatasetMissingFieldsOfIsOpenData.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.openDataCategories", "$.references", "$.fileReferences")))
    }

    @Test
    fun ingridPostGeoDatasetMissingFieldsOfIsHvd() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geodatasetMissingFieldsOfIsHvd.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.hvdCategories", "$.properties")))
    }

    @Test
    fun ingridPostGeoDatasetMissingFieldsOfIsAdVCompatible() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geodatasetMissingFieldsOfIsAdVCompatible.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.advProductGroups", "$.pointOfContact")))
    }

    @Test
    fun ingridPostGeoDatasetMissingFieldsOfIsInspireIdentifiedConform() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geodatasetMissingFieldsOfIsInspireIdentifiedConform.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.themes", "$.spatialScope", "$.spatialRepresentationType", "$.distribution.format", "$.conformanceResult", "$.resource.accessConstraints")))
    }

    @Test
    fun ingridPostGeoDatasetMissingFieldsOfIsInspireIdentifiedNotConform() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geodatasetMissingFieldsOfIsInspireIdentifiedNotConform.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.themes", "$.spatialScope", "$.distribution.format", "$.conformanceResult", "$.resource.accessConstraints")))
    }

    @Test
    fun ingridPostGeoServiceMissingFieldsOfIsOpenData() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geoserviceMissingFieldsOfIsOpenData.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.openDataCategories", "$.references", "$.fileReferences")))
    }

    @Test
    fun ingridPostGeoServiceMissingFieldsOfIsAdVCompatible() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geoserviceMissingFieldsOfIsAdVCompatible.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.advProductGroups", "$.pointOfContact")))
    }

    @Test
    fun ingridPostGeoServiceMissingFieldsOfIsInspireIdentifiedRelevant() {
        postRecord(
            "test_catalog_ogc",
            "/ogc/ingrid/geoserviceMissingFieldsOfIsInspireIdentifiedRelevant.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.themes")))
    }

    @Test
    fun hmdkPostGeoDatasetMinimum() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geodatasetMinimumForPublish.json",
        ).andExpect(status().isCreated)
    }

    @Test
    fun hmdkPostGeoServiceMinimum() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geoserviceMinimumForPublish.json",
        ).andExpect(status().isCreated)
    }

    @Test
    fun hmdkPostGeoDatasetMissingFieldsOfIsHvd() {
        postRecord(
            "hmdk_catalog",
            "/ogc/ingrid/geodatasetMissingFieldsOfIsHvd.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.hvdCategories", "$.properties")))
    }

    @Test
    fun hmdkPostGeoDatasetMissingFieldsOfIsAdVCompatible() {
        postRecord(
            "hmdk_catalog",
            "/ogc/ingrid/geodatasetMissingFieldsOfIsAdVCompatible.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.advProductGroups", "$.pointOfContact")))
    }

    @Test
    fun hmdkPostGeoDatasetMissingFieldsOfIsOpenData() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geodatasetMissingFieldsOfIsOpenData.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.openDataCategories", "$.pointOfContact", "$.references", "$.fileReferences")))
    }

    @Test
    fun hmdkPostGeoDatasetMissingFieldsOfPublicationHmbTG() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geodatasetMissingFieldsOfPublicationHmbTG.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.openDataCategories", "$.informationHmbTG", "$.pointOfContact", "$.references", "$.fileReferences")))
    }

    @Test
    fun hmdkPostGeoDatasetMissingFieldsOfIsInspireIdentifiedConform() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geodatasetMissingFieldsOfIsInspireIdentifiedConform.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.themes", "$.spatialScope", "$.spatialRepresentationType", "$.distribution.format", "$.conformanceResult", "$.resource.accessConstraints")))
    }

    @Test
    fun hmdkPostGeoDatasetMissingFieldsOfIsInspireIdentifiedNotConform() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geodatasetMissingFieldsOfIsInspireIdentifiedNotConform.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.themes", "$.spatialScope", "$.distribution.format", "$.conformanceResult", "$.resource.accessConstraints")))
    }

    @Test
    fun hmdkPostGeoServiceMissingFieldsOfIsOpenData() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geoserviceMissingFieldsOfIsOpenData.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.openDataCategories", "$.pointOfContact", "$.references", "$.fileReferences")))
    }

    @Test
    fun hmdkPostGeoServiceMissingFieldsOfIsAdVCompatible() {
        postRecord(
            "hmdk_catalog",
            "/ogc/ingrid/geoserviceMissingFieldsOfIsAdVCompatible.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.advProductGroups", "$.pointOfContact")))
    }

    @Test
    fun hmdkPostGeoServiceMissingFieldsOfIsInspireIdentifiedRelevant() {
        postRecord(
            "hmdk_catalog",
            "/ogc/hmdk/geoserviceMissingFieldsOfIsInspireIdentifiedRelevant.json",
        ).andExpect(status().isBadRequest)
            .andExpect(jsonPath("$.errorCode").value("VALIDATION_ERROR"))
            .andExpect(jsonPath("$.errorText").value(containsString("validation")))
            .andExpect(jsonPath("$.data.error[*].instanceLocation").value(hasItems("$.themes")))
    }

    private fun resourceText(path: String): String = requireNotNull(this::class.java.getResource(path)) { "Missing resource: $path" }
        .readText(StandardCharsets.UTF_8)

    private fun execSQL(sqlFile: String) {
        val sql = {}.javaClass.getResource(sqlFile)?.readText()!!
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql)
                .executeUpdate()
        }
    }
}
