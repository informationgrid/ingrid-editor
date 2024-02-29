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
class M082_MigrateCatalogSettings : MigrationBase("0.82") {
    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            entityManager
                .createNativeQuery("UPDATE catalog SET settings = settings - 'exportFormat'")
                .executeUpdate()
            entityManager
                .createNativeQuery("UPDATE catalog SET settings = settings #- '{config,ibus}'")
                .executeUpdate()
            entityManager
                .createNativeQuery(
                    """
              UPDATE settings
              SET value = (to_jsonb(REPLACE(CAST(value as text), '"url"', '"name"')))
              WHERE key = 'ibus';
          """.trimIndent()
                )
                .executeUpdate()
            entityManager
                .createNativeQuery(
                    """
              UPDATE settings
              SET value = (
                 SELECT jsonb_agg(value - 'publicationTypes')
                 FROM jsonb_array_elements(settings.value) AS elements(value)
              )
              WHERE key = 'ibus';
          """.trimIndent()
                )
                .executeUpdate()
        }
    }
}
