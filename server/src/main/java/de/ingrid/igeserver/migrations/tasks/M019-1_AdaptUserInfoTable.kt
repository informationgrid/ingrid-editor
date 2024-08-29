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
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class `M019-1_AdaptUserInfoTable` : MigrationBase("0.19.1") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
            CREATE TABLE IF NOT EXISTS manager (
              user_id      integer REFERENCES user_info(id) ON DELETE CASCADE,
              manager_id   integer REFERENCES user_info(id) ON DELETE CASCADE,
              catalog_id   integer REFERENCES catalog(id) ON DELETE CASCADE,
              PRIMARY KEY (user_id, catalog_id)
            );
            
            CREATE TABLE IF NOT EXISTS stand_in (
              user_id      integer REFERENCES user_info(id) ON DELETE CASCADE,
              stand_in_id  integer REFERENCES user_info(id) ON DELETE CASCADE,
              catalog_id   integer REFERENCES catalog(id) ON DELETE CASCADE,
              PRIMARY KEY (user_id, stand_in_id, catalog_id)
            );
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }
}
