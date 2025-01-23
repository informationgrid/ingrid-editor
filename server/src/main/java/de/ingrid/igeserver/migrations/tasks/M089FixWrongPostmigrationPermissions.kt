/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
class M089FixWrongPostmigrationPermissions : MigrationBase("0.89") {
    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            // set parent_object to parent_acl.id where it is not set correctly
            entityManager
                .createNativeQuery(
                    """
                UPDATE acl_object_identity acl
                SET parent_object = parent_acl.id
                FROM document_wrapper dw
                         JOIN acl_object_identity parent_acl ON dw.parent_id\:\:varchar(255) = parent_acl.object_id_identity
                WHERE acl.object_id_identity = dw.id\:\:varchar(255)
                  AND acl.parent_object != parent_acl.id;
                    """.trimIndent(),
                )
                .executeUpdate()
        }
    }
}
