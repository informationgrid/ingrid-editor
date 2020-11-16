package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.services.AuditLogger
import org.assertj.core.api.Assertions
import org.junit.Test
import org.junit.runner.RunWith
import org.springframework.beans.factory.annotation.Autowired
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
class AuditLogTest {

    @Autowired
    private lateinit var auditLog: AuditLogger

    @Autowired
    private lateinit var dbService: PostgreSQLDatabase

    @Test
    fun `logging a message`() {

        val oldCount = dbService.findAll(AuditLogRecordType::class).size

        auditLog.log("category", "action", "target", null, null)

        Assertions.assertThat(dbService.findAll(AuditLogRecordType::class).size).isEqualTo(oldCount + 1)
    }
}