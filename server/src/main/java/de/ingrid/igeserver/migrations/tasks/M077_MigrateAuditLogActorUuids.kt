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
import de.ingrid.igeserver.services.UserManagementService
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M077_MigrateAuditLogActorUuids : MigrationBase("0.77") {
    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var userManagementService: UserManagementService

    private val uuidSql = """
        SELECT Distinct message->>'actor' as actor
        FROM audit_log
    """.trimIndent()

    private val updateSql = """
        UPDATE audit_log SET
            message = jsonb_set(message, '{actor}', to_jsonb(:login))
        WHERE 
            message->>'actor' = :uuid
    """.trimIndent()

    override fun exec() {
        setAdminAuthentication("Migration", "Task")
        ClosableTransaction(transactionManager).use {
            val keycloakUuids = entityManager.createNativeQuery(uuidSql).resultList

            userManagementService.getClient().use { client ->
                keycloakUuids
                    .filterNotNull()
                    .forEach { uuid ->
                        getLogin(uuid as String)?.let { login ->
                            migrateUUIDToLogin(login, uuid)
                        }
                    }
            }
        }
    }

    private fun migrateUUIDToLogin(login: String, uuid: String) {
        entityManager.createNativeQuery(updateSql)
            .setParameter("login", login)
            .setParameter("uuid", uuid)
            .executeUpdate()
    }

    private fun getLogin(uuid: String): String? {
        userManagementService.getClient().use { client ->
            try {
                val user = userManagementService.getKeycloakUserWithUuid(client, uuid)
                return user.username
            } catch (e: Exception) {
                log.info("User with uuid '$uuid' not found. Ignore if uuid is a username.")
                return null
            }
        }
    }
}
