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
class M082MigrateCatalogSettings : MigrationBase("0.82") {
    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {}

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            entityManager
                .createNativeQuery("UPDATE catalog SET settings = settings - 'exportFormat' - 'lastLogSummary'")
                .executeUpdate()
            entityManager
                .createNativeQuery("UPDATE catalog SET settings = settings #- '{config,ibus}'")
                .executeUpdate()
            entityManager
                .createNativeQuery(
                    """
              UPDATE settings
              SET value = ((REPLACE(CAST(value as text), '"url"', '"name"'))\:\:jsonb)
              WHERE key = 'ibus';
                    """.trimIndent(),
                )
                .executeUpdate()

            // remove publicationTypes field where it was set
            entityManager
                .createNativeQuery(
                    """
              UPDATE settings
              SET value = (
                 SELECT jsonb_agg(value - 'publicationTypes')
                 FROM jsonb_array_elements(settings.value) AS elements(value)
              )
              WHERE jsonb_path_exists(value, '$.publicationTypes');
                    """.trimIndent(),
                )
                .executeUpdate()

            // add id-field to each iBus configuration
            entityManager
                .createNativeQuery(
                    """
            WITH unnested AS (
                SELECT id,
                     jsonb_array_elements(value)                       AS element,
                     generate_series(0, jsonb_array_length(value) - 1) AS index
                FROM settings
                WHERE key = 'ibus'),
            updated_elements AS (
                SELECT id,
                       jsonb_set(element, '{id}', to_jsonb(index\:\:text)) AS updated_element
                FROM unnested)
            UPDATE settings
            SET value=(SELECT jsonb_agg(updated_element) AS updated_data
                       FROM updated_elements
                       WHERE settings.id = updated_elements.id) 
            WHERE key='ibus';
                    """.trimIndent(),
                )
                .executeUpdate()
        }
    }
}
