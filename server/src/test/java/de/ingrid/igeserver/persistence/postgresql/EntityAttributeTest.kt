package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.test.context.junit4.SpringRunner

@RunWith(SpringRunner::class)
@SpringBootTest(classes = [IgeServer::class])
@ActiveProfiles("postgresql")
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts=["/test_data.sql"], config=SqlConfig(encoding="UTF-8"))
class EntityAttributeTest {
    // TODO check if json representation meets the expectations (compare against api definition)
    @Test
    fun `TODO`() {

    }
}