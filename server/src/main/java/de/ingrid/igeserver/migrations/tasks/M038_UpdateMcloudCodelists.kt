/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M038_UpdateMcloudCodelists : MigrationBase("0.38") {

    private var log = logger()

    @Autowired
    lateinit var catalogRepo: CatalogRepository

    @Autowired
    lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager


    override fun exec() {
        log.info("Update mCLOUD Codelists!")

        ClosableTransaction(transactionManager).use {
            try {
                val mCloudProfile = catalogService.getCatalogProfile("mcloud")
                catalogRepo.findAll()
                    .filter { catalog: Catalog -> catalog.type == mCloudProfile.identifier }
                    .forEach { catalog: Catalog ->
                        log.info("Update Catalog: " + catalog.name)
                        catalogService.initializeCodelists(catalog.identifier, catalog.type)
                    }
            } catch (e: NotFoundException) {
                log.debug("Cannot update mcloud codelists, since mcloud profile is not activated")
            }
        }
    }

}
