package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryOperator
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.repository.AuditLogRepository
import de.ingrid.igeserver.services.AuditLogger
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.assertj.core.api.Assertions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig

@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts=["/test_data.sql"], config=SqlConfig(encoding="UTF-8"))
class AuditLogTest : AnnotationSpec() {

    override fun listeners() = listOf(SpringListener)

    @Autowired
    private lateinit var auditLog: AuditLogger
    
    @Autowired
    private lateinit var auditRepo: AuditLogRepository

    @Test
    fun `logging a message`() {

        val oldCount = auditRepo.count()

        auditLog.log("category", "action", "target", null, "audit.data-history")

        Assertions.assertThat(auditRepo.count()).isEqualTo(oldCount + 1)

        val result = auditRepo.findAllByLoggerAndData_Target("audit.data-history", "target")

        Assertions.assertThat(result.size).isEqualTo(1)
        Assertions.assertThat(result[0].data?.target).isEqualTo("target")
    }
}