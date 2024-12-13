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
package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M081UpdateAuditLogMessages : MigrationBase("0.81") {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val updateSql = """
        UPDATE audit_log SET
            logger = 'audit.data-history',
            message = jsonb_set(message, '{cat}', to_jsonb(:cat))            
        WHERE 
            message->>'action' = 'unpublish'
    """.trimIndent()

    override fun exec() {
        setAdminAuthentication("Migration", "Task")
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(updateSql)
                .setParameter("cat", "data-history")
                .executeUpdate()
        }
    }
}
