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
import com.ninjasquad.springmockk.MockkBean
import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.services.UserManagementService
import io.kotest.core.extensions.ApplyExtension
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.extensions.spring.SpringExtension
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.testcontainers.service.connection.ServiceConnection
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.testcontainers.containers.PostgreSQLContainer

@SpringBootTest(classes = [IgeServer::class], webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = ["/test_data_acl.sql"], config = SqlConfig(encoding = "UTF-8"))
@AutoConfigureMockMvc(addFilters = false)
@ApplyExtension(SpringExtension::class)
@ContextConfiguration(classes = [(IgeServer::class)])
@ActiveProfiles(profiles = ["default", "uvp", "ogc-api", "ingrid", "mcloud", "ingrid-krzn", "opendata", "ingrid-hmdk", "ingrid-lfubayern"])
class IntegrationTest : AnnotationSpec() {

    @MockkBean(relaxed = true)
    lateinit var userManagementService: UserManagementService

    companion object {
        @ServiceConnection
        private val postgres = PostgreSQLContainer("postgres:17-alpine")
            .apply { start() }
    }
}
