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
package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.node.JsonNodeFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.DocumentState
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager

@Component
class EnhanceGroupsTask(
    val entityManager: EntityManager,
    val groupService: GroupService,
    val aclService: IgeAclService,
    val documentService: DocumentService,
    val transactionManager: PlatformTransactionManager,
) {
    val log = logger()

    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogs = getCatalogsForTask()
        if (catalogs.isEmpty()) return

        setAdminAuthentication("EnhanceGroups", "Task")

        catalogs.forEach { catalog ->
            log.info("Execute EnhanceGroupTask for catalog: $catalog")
            ClosableTransaction(transactionManager).use {
                enhanceGroupsWithReferencedAddresses(catalog)
                removePostMigrationInfo(catalog)
                log.info("Finished EnhanceGroupTask for catalog: $catalog")
            }
        }
    }

    fun enhanceGroupsWithReferencedAddresses(catalogIdentifier: String) {
        groupService
            .getAll(catalogIdentifier)
            .forEach { group ->

                val docIds = getAllAccessibleDocuments(group, catalogIdentifier)
                val addressIds = getAllAccessibleAddresses(group, catalogIdentifier)
                val referencedAddressIds = getReferencedAddressIds(docIds, catalogIdentifier)

                // all addresses that are referenced by the documents and not already in the group
                val newAddressPermissions = referencedAddressIds.filter { !addressIds.contains(it) }
                    .map {
                        log.info("Enhance permission in catalog '$catalogIdentifier' for group '${group.name}' for addressId: $it")
                        JsonNodeFactory.instance.objectNode()
                            .put("id", it)
                            .put("permission", "readTree")
                            .put("isFolder", false)
                    }

                val addressPermissions = group.permissions?.addresses ?: emptyList()
                group.permissions?.addresses = addressPermissions + newAddressPermissions

                groupService.update(catalogIdentifier, group.id!!, group, true)
            }
    }

    private fun getAllAccessibleAddresses(
        group: Group,
        catalogIdentifier: String,
    ): Set<Int> = this.getAllAccessibleDatasets(group, catalogIdentifier, true)

    private fun getAllAccessibleDocuments(
        group: Group,
        catalogIdentifier: String,
    ): Set<Int> = this.getAllAccessibleDatasets(group, catalogIdentifier, false)

    private fun getAllAccessibleDatasets(
        group: Group,
        catalogIdentifier: String,
        forAddress: Boolean = false,
    ): Set<Int> {
        val rootIds = aclService.getDatasetIdsSetInGroups(listOf(group), isAddress = forAddress)
        val rootDescendentIds = rootIds.flatMap {
            documentService.getAllDescendantIds(catalogIdentifier, it)
        }
        return (rootIds + rootDescendentIds).toSet()
    }

    private fun getReferencedAddressIds(
        docIds: Set<Int>,
        catalogIdentifier: String,
    ): Set<Int> = docIds
        .map { documentService.getWrapperById(it) }
        .flatMap { wrapper -> getAllReferencedDocumentIds(wrapper, catalogIdentifier) }
        .toSet()

    private fun getAllReferencedDocumentIds(
        wrapper: DocumentWrapper,
        catalogIdentifier: String,
    ) = listOf(
        DocumentState.PUBLISHED,
        DocumentState.DRAFT,
        DocumentState.DRAFT_AND_PUBLISHED,
        DocumentState.PENDING,
    ).mapNotNull {
        try {
            documentService.docRepo.getByCatalog_IdentifierAndUuidAndState(catalogIdentifier, wrapper.uuid, it)
        } catch (e: Exception) {
            // no document with specific state found
            null
        }
    }.flatMap {
        try {
            documentService.getReferencedWrapperIds(catalogIdentifier, it)
        } catch (e: Exception) {
            // ignore invalid references
            emptySet()
        }
    }

    private fun getCatalogsForTask(): List<String> = try {
        entityManager
            .createQuery(
                "SELECT version FROM VersionInfo version WHERE version.key = 'doEnhanceGroups'",
                VersionInfo::class.java,
            )
            .resultList
            .map { it.value!! }
    } catch (e: Exception) {
        log.warn("Could not query version_info table")
        emptyList()
    }

    private fun removePostMigrationInfo(catalogIdentifier: String) {
        entityManager
            .createQuery(
                "DELETE FROM VersionInfo version WHERE version.key = 'doEnhanceGroups' AND version.value = '$catalogIdentifier'",
            )
            .executeUpdate()
    }
}
