package de.ingrid.igeserver.persistence.postgresql

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.repository.AuditLogRepository
import de.ingrid.igeserver.services.AuditLogger
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.longs.shouldBeExactly
import io.kotest.matchers.shouldBe
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig

@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = ["/test_data.sql"], config = SqlConfig(encoding = "UTF-8"))
class AuditLogTest : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    @Autowired
    private lateinit var auditLog: AuditLogger

    @Autowired
    private lateinit var auditRepo: AuditLogRepository

    @Test
    fun `logging a message`() {

        val oldCount = auditRepo.count()

        auditLog.log("category", "action", "target", null, "audit.data-history")

        auditRepo.count() shouldBeExactly oldCount + 1

        val result = auditRepo.findAllByLogger("audit.data-history").filter { it.message?.target == "target" }

        result.size shouldBeExactly 1
        result[0].message?.target shouldBe "target"
    }
}