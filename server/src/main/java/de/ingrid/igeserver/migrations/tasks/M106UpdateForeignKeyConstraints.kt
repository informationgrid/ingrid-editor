/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
class M106UpdateForeignKeyConstraints : MigrationBase("0.106") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        -- 1. Update permission_group: make manager_id nullable and update foreign key to ON DELETE SET NULL
        ALTER TABLE permission_group ALTER COLUMN manager_id DROP NOT NULL;
        ALTER TABLE permission_group DROP CONSTRAINT IF EXISTS permission_group_manager_id_fkey;
        ALTER TABLE permission_group ADD CONSTRAINT permission_group_manager_id_fkey
            FOREIGN KEY (manager_id) REFERENCES user_info (id) ON DELETE SET NULL;

        -- 2. Update query: update user_id foreign key to ON DELETE SET NULL
        ALTER TABLE query DROP CONSTRAINT IF EXISTS query_user_id_fkey;
        ALTER TABLE query ADD CONSTRAINT query_user_id_fkey
            FOREIGN KEY (user_id) REFERENCES user_info (id) ON DELETE SET NULL;

        -- 3. Ensure user_group foreign keys have ON DELETE CASCADE
        ALTER TABLE user_group DROP CONSTRAINT IF EXISTS user_group_permission_group_id_fk;
        ALTER TABLE user_group ADD CONSTRAINT user_group_permission_group_id_fk
            FOREIGN KEY (group_id) REFERENCES permission_group (id) ON DELETE CASCADE;

        ALTER TABLE user_group DROP CONSTRAINT IF EXISTS user_group_user_info_id_fk;
        ALTER TABLE user_group ADD CONSTRAINT user_group_user_info_id_fk
            FOREIGN KEY (user_info_id) REFERENCES user_info (id) ON DELETE CASCADE;

        -- 4. Update legacy manager table foreign keys to ON DELETE RESTRICT if table exists
        DO ${'$'}${'$'}
        BEGIN
            IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'manager') THEN
                ALTER TABLE manager DROP CONSTRAINT IF EXISTS manager_catalog_id_fkey;
                ALTER TABLE manager ADD CONSTRAINT manager_catalog_id_fkey
                    FOREIGN KEY (catalog_id) REFERENCES catalog (id) ON DELETE RESTRICT;

                ALTER TABLE manager DROP CONSTRAINT IF EXISTS manager_manager_id_fkey;
                ALTER TABLE manager ADD CONSTRAINT manager_manager_id_fkey
                    FOREIGN KEY (manager_id) REFERENCES user_info (id) ON DELETE RESTRICT;
            END IF;
        END ${'$'}${'$'};
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }
}
