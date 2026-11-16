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

/**
 * The special BWaStr IDs (e.g. 7000 - Nordsee) moved from the BAW catalog codelist "bwastrids"
 * to the general codelist "BAW_bwastrIds", so the catalog codelist is removed.
 */
@Service
class M107RemoveCatalogCodelistBwastrIds : MigrationBase("0.107") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            val count = entityManager
                .createNativeQuery("DELETE FROM codelist WHERE identifier = 'bwastrids'")
                .executeUpdate()
            log.info("Removed catalog codelist 'bwastrids' from $count catalog(s)")
        }
    }
}
