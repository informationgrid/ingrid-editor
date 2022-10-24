package de.ingrid.igeserver.persistence.postgresql

import IntegrationTest
import de.ingrid.igeserver.repository.AuditLogRepository
import de.ingrid.igeserver.services.AuditLogger
import io.kotest.matchers.ints.shouldBeExactly
import io.kotest.matchers.longs.shouldBeExactly
import io.kotest.matchers.shouldBe
import org.springframework.beans.factory.annotation.Autowired

class AuditLogTest : IntegrationTest() {

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