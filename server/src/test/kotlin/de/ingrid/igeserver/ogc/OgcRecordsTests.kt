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
package de.ingrid.igeserver.ogc

import IntegrationTest
import de.ingrid.igeserver.features.ogc_api_records.api.RecordFormat
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.test.web.servlet.MockMvc
import org.springframework.test.web.servlet.request.MockMvcRequestBuilders.get
import org.springframework.test.web.servlet.result.MockMvcResultHandlers.print
import org.springframework.test.web.servlet.result.MockMvcResultMatchers.status
import org.springframework.transaction.PlatformTransactionManager

@WithMockUser(username = "user1", authorities = ["cat-admin"])
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
    val formats = listOf(RecordFormat.json, RecordFormat.geojson, RecordFormat.html) // , RecordFormat.INGRID_ISO)

    @Before
    fun beforeTest() {
//        clearAllMocks()
        execSQL("/ogc/data.sql")
        every {
            mockPrincipal.authorities
        }.returns(listOf(SimpleGrantedAuthority("cat-admin")))
        every {
            mockPrincipal.principal
        }.returns("user1")
        every {
            mockPrincipal.isAuthenticated
        }.returns(true)
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

    private fun execSQL(sqlFile: String) {
        val sql = {}.javaClass.getResource(sqlFile)?.readText()!!
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql)
                .executeUpdate()
        }
    }
}
