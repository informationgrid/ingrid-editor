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
class M097UpdateFingerprintExportType : MigrationBase("0.97") {
    val log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {
        log.info("Updating fingerprint exportTypes for profile index exporters")

        ClosableTransaction(transactionManager).use {
            // Update fingerprint JSON array to change exportType from profile index exporters to their respective IDF exporters
            val updateQuery = """
                UPDATE document_wrapper
                SET fingerprint = (
                    SELECT jsonb_agg(
                        CASE 
                            -- Default IngridIDFExporter mapping
                            WHEN elem->>'exportType' = 'indexInGridIDF' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            -- Bast profile with custom IDF exporter
                            WHEN elem->>'exportType' = 'indexInGridIDFBast' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDFBast"')
                            -- External Bast profile with custom IDF exporter
                            WHEN elem->>'exportType' = 'indexInGridIDFExternalBast' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDFExternalBast"')
                            -- External LfuBayern profile with custom IDF exporter
                            WHEN elem->>'exportType' = 'indexInGridIDFLfuExternalBayern' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDFLfuExternalBayern"')
                            -- All other profiles use default IngridIDFExporter (ingridIDF)
                            WHEN elem->>'exportType' = 'indexInGridIDFHmdk' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            WHEN elem->>'exportType' = 'indexInGridIDFKrzn' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            WHEN elem->>'exportType' = 'indexInGridIDFLfuBayern' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            WHEN elem->>'exportType' = 'indexInGridIDFLubw' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            WHEN elem->>'exportType' = 'indexInGridIDFUPSH' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            WHEN elem->>'exportType' = 'indexInGridIDFWsv' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            WHEN elem->>'exportType' = 'indexInGridIDFCswWsv' THEN
                                jsonb_set(elem, '{exportType}', '"ingridIDF"')
                            ELSE elem
                        END
                    )
                    FROM jsonb_array_elements(fingerprint) AS elem
                )
                WHERE fingerprint IS NOT NULL 
                AND fingerprint::text ~ 'indexInGrid'
            """.trimIndent()

            val updatedRows = entityManager.createNativeQuery(updateQuery).executeUpdate()
            log.info("Updated fingerprint exportType for $updatedRows document wrappers")
        }
    }
}
