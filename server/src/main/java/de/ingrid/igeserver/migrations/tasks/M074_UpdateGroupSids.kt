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

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

/**
 * Update all group sids with group id instead of name
 */
@Service
class M074_UpdateGroups : MigrationBase("0.74") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager


    override fun exec() {
        log.info("Update acls for groups.")

        ClosableTransaction(transactionManager).use {
            try {
                setAuthentication()
                catalogService.getCatalogs().forEach { catalog: Catalog ->
                    log.info("Update Catalog: " + catalog.name)
                    updateGroupSidsOfCatalog(catalog.identifier)
                }
            } catch (e: NotFoundException) {
                log.debug("Cannot update acl entries to include BasePermission.ADMINISTRATION")
            }
        }
    }


    private fun updateGroupSidsOfCatalog(catalogIdentifier: String) {

        ClosableTransaction(transactionManager).use {
            groupService
                .getAll(catalogIdentifier)
                .forEach { group ->
                    val legacySid = "GROUP_" + group.name
                    val newSid = "GROUP_" + group.id

                    val sql = """
                                UPDATE acl_sid
                                SET sid = '$newSid'
                                WHERE sid = '$legacySid';
                            """.trimIndent()

                    entityManager.createNativeQuery(sql).executeUpdate()
                }
        }
    }
}

