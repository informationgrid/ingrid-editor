package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.node.JsonNodeFactory
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.services.DOCUMENT_STATE
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.services.IgeAclService
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
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

        setAuthentication()

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
        catalogIdentifier: String
    ): Set<Int> = this.getAllAccessibleDatasets(group, catalogIdentifier, true)

    private fun getAllAccessibleDocuments(
        group: Group,
        catalogIdentifier: String
    ): Set<Int> = this.getAllAccessibleDatasets(group, catalogIdentifier, false)

    private fun getAllAccessibleDatasets(
        group: Group,
        catalogIdentifier: String,
        forAddress: Boolean = false
    ): Set<Int> {
        val rootIds = aclService.getDatasetIdsFromGroups(listOf(group), forAddress)
        val rootDescendentIds = rootIds.flatMap {
            documentService.getAllDescendantIds(catalogIdentifier, it)
        }
        return (rootIds + rootDescendentIds).toSet()
    }

    private fun getReferencedAddressIds(
        docIds: Set<Int>,
        catalogIdentifier: String
    ): Set<Int> {
        return docIds
            .map { documentService.getWrapperByDocumentId(it) }
            .flatMap { wrapper -> getAllReferencedDocumentIds(wrapper, catalogIdentifier) }
            .toSet()
    }

    private fun getAllReferencedDocumentIds(
        wrapper: DocumentWrapper,
        catalogIdentifier: String
    ) = listOf(
        DOCUMENT_STATE.PUBLISHED,
        DOCUMENT_STATE.DRAFT,
        DOCUMENT_STATE.DRAFT_AND_PUBLISHED,
        DOCUMENT_STATE.PENDING
    )
        .map {
            try {
                documentService.docRepo.getByCatalog_IdentifierAndUuidAndState(catalogIdentifier, wrapper.uuid, it)
            } catch (e: Exception) {
                //no document with specific state found
                null
            }
        }
        .filterNotNull()
        .flatMap {
            documentService.getReferencedWrapperIds(catalogIdentifier, it)
        }


    private fun getCatalogsForTask(): List<String> {
        return try {
            entityManager
                .createQuery(
                    "SELECT version FROM VersionInfo version WHERE version.key = 'doEnhanceGroups'",
                    VersionInfo::class.java
                )
                .resultList
                .map { it.value!! }
        } catch (e: Exception) {
            log.warn("Could not query version_info table")
            emptyList()
        }
    }

    private fun removePostMigrationInfo(catalogIdentifier: String) {
        entityManager
            .createQuery(
                "DELETE FROM VersionInfo version WHERE version.key = 'doEnhanceGroups' AND version.value = '${catalogIdentifier}'"
            )
            .executeUpdate()
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken(
                "System",
                "Task",
                listOf(
                    SimpleGrantedAuthority("cat-admin"),
                    SimpleGrantedAuthority("ROLE_ACL_ACCESS"), // needed for ACL changes
                )
            )
        SecurityContextHolder.getContext().authentication = auth
    }

}
