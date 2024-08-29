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
import de.ingrid.igeserver.repository.UserRepository
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

/**
 * Transform userIds of users to lowercase
 */
@Service
class M047LowercaseLogins : MigrationBase("0.47") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var userRepo: UserRepository

    override fun exec() {
        // do everything in postExec
    }

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            setAdminAuthentication("Migration", "Task")

            val allUsers = userRepo.findAll()

            allUsers.forEach { user ->
                try {
                    if (user.userId == user.userId.lowercase()) return@forEach
                    if (allUsers.find { it.userId == user.userId.lowercase() } != null) {
                        log.warn("User ${user.userId} already exists as lowercase version")
                        return@forEach
                    }

                    user.userId = user.userId.lowercase()
                    userRepo.saveAndFlush(user)
                } catch (ex: Exception) {
                    log.error("Error migrating user ${user.userId}", ex)
                }
            }
        }
    }
}
