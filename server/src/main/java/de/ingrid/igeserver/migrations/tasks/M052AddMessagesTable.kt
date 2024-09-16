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
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M052AddMessagesTable : MigrationBase("0.52") {

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val sql = """
        CREATE SEQUENCE messages_id_seq INCREMENT 1 MINVALUE 1 MAXVALUE 2147483647 CACHE 1;
        CREATE TABLE messages (
            "id" integer DEFAULT nextval('messages_id_seq') NOT NULL,
            "catalog_id" integer,
            "message" jsonb NOT NULL,
            "expires" timestamptz,
            CONSTRAINT "messages_pkey" PRIMARY KEY ("id"),
            CONSTRAINT "messages_catalog_id_fkey" FOREIGN KEY (catalog_id) REFERENCES catalog (id) ON DELETE CASCADE NOT DEFERRABLE
        ) WITH (oids = false);
    """.trimIndent()

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            entityManager.createNativeQuery(sql).executeUpdate()
        }
    }
}
