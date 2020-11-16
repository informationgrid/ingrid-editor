package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.model.QueryField
import de.ingrid.igeserver.persistence.FindOptions
import de.ingrid.igeserver.persistence.QueryOperator
import de.ingrid.igeserver.persistence.model.meta.AuditLogRecordType
import de.ingrid.igeserver.services.AuditLogger
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.assertj.core.api.Assertions
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig

@SpringBootTest(classes = [IgeServer::class])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts=["/test_data.sql"], config=SqlConfig(encoding="UTF-8"))
class AuditLogTest : AnnotationSpec() {

    override fun listeners(): List<SpringListener> { return listOf(SpringListener) }

    @Autowired
    private lateinit var auditLog: AuditLogger

    @Autowired
    private lateinit var dbService: PostgreSQLDatabase

    @Test
    fun `logging a message`() {

        val oldCount = dbService.findAll(AuditLogRecordType::class).size

        auditLog.log("category", "action", "target", null, "audit.data-history")

        Assertions.assertThat(dbService.findAll(AuditLogRecordType::class).size).isEqualTo(oldCount + 1)

        val queryMap = listOfNotNull(
                QueryField("logger", "audit.data-history"),
                QueryField("target", "target")
        ).toList()

        val result = dbService.acquireDatabase("is_not_used_by_postgresql").use {
            val findOptions = FindOptions(
                    queryOperator = QueryOperator.AND
            )
            dbService.findAll(AuditLogRecordType::class, queryMap, findOptions)
        }

        Assertions.assertThat(result.totalHits).isEqualTo(1)
        Assertions.assertThat(result.hits[0].get("target")?.textValue()).isEqualTo("target")
    }
}