package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.node.JsonNodeFactory
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.services.*
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.security.Principal
import javax.persistence.EntityManager

@Component
class PostMigrationTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
    val catalogService: CatalogService,
    val groupService: GroupService,
    val documentService: DocumentService,
    val mapperService: MapperService,
    val aclService: IgeAclService
) {
    val log = logger()

    // this ensures that the post migration task is executed after the initial db migrations
    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogs = getCatalogsForPostMigration()
        if (catalogs.isEmpty()) return

        setAuthentication()

        catalogs.forEach { catalog ->
            log.info("Execute post migration for catalog: $catalog")
            ClosableTransaction(transactionManager).use {
                doPostMigration(catalog)
                removePostMigrationInfo(catalog)
            }
        }

    }

    private fun getCatalogsForPostMigration(): List<String> {
        return try {
            entityManager
                .createQuery(
                    "SELECT version FROM VersionInfo version WHERE version.key = 'doPostMigrationFor'",
                    VersionInfo::class.java
                )
                .resultList
                .map { it.value!! }
        } catch (e: Exception) {
            log.warn("Could not query version_info table")
            emptyList()
        }
    }

    private fun doPostMigration(catalogIdentifier: String) {
        adaptUVPFolderStructure(catalogIdentifier)
        saveAllGroupsOfCatalog(catalogIdentifier)
        enhanceGroupsWithReferencedAddresses(catalogIdentifier)
        initializeCatalogCodelistsAndQueries(catalogIdentifier)
    }

    private fun saveAllGroupsOfCatalog(catalogIdentifier: String) {
        groupService
            .getAll(catalogIdentifier)
            .forEach { group ->
                groupService.update(catalogIdentifier, group.id!!, group, true)
            }
    }

    private fun adaptUVPFolderStructure(catalogIdentifier: String) {
        if (catalogService.getCatalogById(catalogIdentifier).type != "uvp") return
        documentService.getAllDocumentWrappers(catalogIdentifier).forEach { doc ->
            log.info("Migrate document: ${doc.id}")
            migratePath(doc)
        }

    }

    private fun migratePath(doc: DocumentWrapper) {
        val oldPath = doc.path // Style: [typeFolderId, FolderId, ...]
        val reorderedPath = oldPath.subList(1, oldPath.size) + oldPath[0] // Style: [FolderId, ..., typeFolderId]
        val pathTitles = reorderedPath.map {
            val wrapper = documentService.getWrapperByDocumentId(it.toInt())
            documentService.getLatestDocument(wrapper).title!!
        }

        val newPath = createAndGetPathByTitles(pathTitles, doc.catalog!!.identifier)

        doc.path = newPath.map { it.toString() }
        documentService.aclService.updateParent(doc.id!!, newPath.last())
        doc.parent = documentService.docWrapperRepo.findById(newPath.last()).get()
        documentService.docWrapperRepo.save(doc)
    }

    private fun createAndGetPathByTitles(titles: List<String>, catalogIdentifier: String): MutableList<Int> {
        val auth = SecurityContextHolder.getContext().authentication
        val createdPathIds = mutableListOf<Int>()
        var parentId: Int? = null
        for (title in titles) {
            val foundChild = documentService.findChildren(
                catalogIdentifier,
                parentId
            ).hits.filter { documentService.getLatestDocument(it).title == title }
            if (foundChild.isEmpty()) {
                //create new folder
                val folderData = jacksonObjectMapper().createObjectNode()
                    .put("_type", "FOLDER")
                    .put("_parent", parentId.toString())
                    .put("title", title)
                val folderDoc =
                    documentService.createDocument(auth as Principal, catalogIdentifier, folderData, parentId)

                parentId = folderDoc.get("_id").asInt()

            } else {
                //found folder
                parentId = foundChild.first().id!!
            }
            createdPathIds.add(parentId)
        }
        return createdPathIds
    }

    private fun enhanceGroupsWithReferencedAddresses(catalogIdentifier: String) {
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
    ) = listOf(wrapper.published, wrapper.draft, wrapper.pending).flatMap {
        getReferencedDocumentIds(it, catalogIdentifier)
    }

    private fun getReferencedDocumentIds(
        document: Document?,
        catalogIdentifier: String
    ): Set<Int> {
        if (document == null) return setOf()

        val docType = documentService.getDocumentType(document.type)
        return docType.getReferenceIds(document).map {
            documentService.getWrapperByCatalogAndDocumentUuid(catalogIdentifier, it).id!!
        }.toSet()

    }

    private fun initializeCatalogCodelistsAndQueries(catalogIdentifier: String) {
        val catalogType = catalogService.getCatalogById(catalogIdentifier).type
        catalogService.initializeCatalog(catalogIdentifier, catalogType)
    }

    private fun removePostMigrationInfo(catalogIdentifier: String) {
        entityManager
            .createQuery(
                "DELETE FROM VersionInfo version WHERE version.key = 'doPostMigrationFor' AND version.value = '${catalogIdentifier}'"
            )
            .executeUpdate()
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken(
                "Scheduler",
                "Task",
                listOf(
                    SimpleGrantedAuthority("cat-admin"),
                    SimpleGrantedAuthority("ROLE_GROUP_MANAGER"), // needed for ACL changes
                )
            )
        SecurityContextHolder.getContext().authentication = auth
    }

}
