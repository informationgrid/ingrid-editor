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
