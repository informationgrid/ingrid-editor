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

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.NullNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.node.TextNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.TagRequest
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.utils.convertToDocument
import de.ingrid.igeserver.utils.setAdminAuthentication
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.security.Principal

@Component
class PostMigrationTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
    val catalogService: CatalogService,
    val groupService: GroupService,
    val documentService: DocumentService,
    val docRepo: DocumentRepository,
    val aclService: IgeAclService,
    val codelistHandler: CodelistHandler,
    val fixPathsTask: FixPathsTask,
    val enhanceGroupsTask: EnhanceGroupsTask,
) {
    val log = logger()

    // this ensures that the post migration task is executed after the initial db migrations
    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogs = getCatalogsForPostMigration()
        if (catalogs.isEmpty()) return

        setAdminAuthentication("Postmigration", "Task")

        catalogs.forEach { catalog ->
            log.info("Execute post migration for catalog: $catalog")
            ClosableTransaction(transactionManager).use {
                doPostMigration(catalog)
                removePostMigrationInfo(catalog)
                log.info("Finished post migration for catalog: $catalog")
            }
        }
    }

    private fun getCatalogsForPostMigration(): List<String> = try {
        entityManager
            .createQuery(
                "SELECT version FROM VersionInfo version WHERE version.key = 'doPostMigrationFor'",
                VersionInfo::class.java,
            )
            .resultList
            .map { it.value!! }
    } catch (e: Exception) {
        log.warn("Could not query version_info table")
        emptyList()
    }

    private fun doPostMigration(catalogIdentifier: String) {
        // Warning: Execution Order is important
        saveAllGroupsOfCatalog(catalogIdentifier)
        initializeCatalogCodelistsAndQueries(catalogIdentifier)
        uvpAdaptFolderStructure(catalogIdentifier)
        restructureObjectsWithChildren(catalogIdentifier)
        uvpSplitFreeAddresses(catalogIdentifier)
        fixSpatialSystems(catalogIdentifier)
        fixPathsTask.migratePaths(catalogIdentifier)
        enhanceGroupsTask.enhanceGroupsWithReferencedAddresses(catalogIdentifier)
    }

    private fun fixSpatialSystems(catalogIdentifier: String) {
        val documents = docRepo.findAllByCatalog_Identifier(catalogIdentifier)
        codelistHandler.fetchCodelists()

        documents.forEach { doc ->
            val data = doc.data
            val spatial = data.get("spatial") as ObjectNode? ?: return@forEach
            val spatialSystems = spatial.get("spatialSystems") as ArrayNode? ?: return@forEach
            if (!spatialSystems.isEmpty) {
                spatialSystems.map { lookupSpatialSystem(it) }
                spatial.set<ArrayNode>("spatialSystems", spatialSystems)
                data.set<JsonNode>("spatial", spatial)
                doc.data = data
                docRepo.save(doc)
            }
        }
    }

    private fun lookupSpatialSystem(spatialSystem: JsonNode): JsonNode {
        val potentialId = spatialSystem.get("value")?.asText() ?: return spatialSystem
        if (codelistHandler.getCodelistEntry("100", potentialId) != null) {
            (spatialSystem as ObjectNode).put("key", potentialId)
        }
        return spatialSystem
    }

    private fun saveAllGroupsOfCatalog(catalogIdentifier: String) {
        groupService
            .getAll(catalogIdentifier)
            .forEach { group ->
                groupService.update(catalogIdentifier, group.id!!, group, true)
            }
    }

    private fun uvpSplitFreeAddresses(catalogIdentifier: String) {
        if (catalogService.getCatalogById(catalogIdentifier).type != "uvp") return

        val auth = SecurityContextHolder.getContext().authentication

        // root Addresses which aren't organizations are free addresses
        val freeAddresses = documentService.findChildrenDocs(
            catalogIdentifier,
            null,
            isAddress = true,
        ).hits.filter { "UvpAddressDoc" == it.wrapper.type }

        if (freeAddresses.isEmpty()) return

        val rootFolderId = createFreeAddressFolder(catalogIdentifier)
        freeAddresses.forEach {
            val doc = it.document
            val organization = doc.data.get("organization").asText()

            if (organization.isNullOrEmpty() || organization == "null") {
                // free address without organization. no action needed
                it.wrapper.path = listOf(rootFolderId)
                it.wrapper.parent = documentService.docWrapperRepo.findById(rootFolderId).get()
                return
            } else {
                // {"_type":"UvpOrganisationDoc","_parent":null,"organization":"Testorga","title":"Testorga"}
                // create parent organization
                val organizationData = jacksonObjectMapper().createObjectNode()
                    .put("_type", "UvpOrganisationDoc")
                    .putNull("_parent")
                    .put("title", organization)
                    .put("organization", organization)
                val document = convertToDocument(organizationData)
                val organizationDoc = documentService.createDocument(
                    auth as Principal,
                    catalogIdentifier,
                    document,
                    rootFolderId,
                    address = true,
                )
                val parentId = organizationDoc.wrapper.id!!

                it.wrapper.path = listOf(parentId)
                it.wrapper.parent = documentService.docWrapperRepo.findById(parentId).get()
                // save
                documentService.aclService.updateParent(it.wrapper.id!!, parentId)
                documentService.docWrapperRepo.save(it.wrapper)
            }
        }
    }

    private fun createFreeAddressFolder(catalogIdentifier: String): Int {
        val auth = SecurityContextHolder.getContext().authentication
        val folderData = jacksonObjectMapper().createObjectNode()
            .put("_type", "FOLDER")
            .putNull("_parent")
            .put("title", "Freie Adressen")
        val document = convertToDocument(folderData)
        val folderDoc =
            documentService.createDocument(auth as Principal, catalogIdentifier, document, null, true)
        documentService.docWrapperRepo.flush()
        return folderDoc.wrapper.id!!
    }

    private fun createNewFolderFor(
        migratedObject: DocumentWrapper,
        title: String,
    ): Int {
        val auth = SecurityContextHolder.getContext().authentication
        val catalogIdentifier = migratedObject.catalog!!.identifier
        val folderData = jacksonObjectMapper().createObjectNode()
            .put("_type", "FOLDER")
            .put("title", title)

        val document = convertToDocument(folderData)
        val folderDoc =
            documentService.createDocument(
                auth as Principal,
                catalogIdentifier,
                document,
                migratedObject.parent?.id,
                false,
            )
        documentService.docWrapperRepo.flush()
        documentService.updateTags(
            catalogIdentifier,
            folderDoc.wrapper.id!!,
            TagRequest(add = (migratedObject.tags + "migratedFromObject:${migratedObject.uuid}"), remove = emptyList()),
        )
        return folderDoc.wrapper.id!!
    }

    private fun uvpAdaptFolderStructure(catalogIdentifier: String) {
        if (catalogService.getCatalogById(catalogIdentifier).type != "uvp") return
        documentService.getAllDocumentWrappers(catalogIdentifier, includeFolders = true).forEach { doc ->
            log.debug("Migrate document: ${doc.id}")
            migratePath(doc)
        }

        removeOldStructure(catalogIdentifier)
        // save all groups again to update transferred rights
        saveAllGroupsOfCatalog(catalogIdentifier)
    }

    private fun restructureObjectsWithChildren(catalogIdentifier: String) {
        documentService.getAllDocumentWrappers(catalogIdentifier, includeFolders = false).forEach { doc ->
            val foundChildren = documentService.findChildren(
                catalogIdentifier,
                doc.id,
            ).hits

            // only migrate objects with children
            if (foundChildren.isEmpty()) return@forEach

            val title = documentService.getDocumentByWrapperId(catalogIdentifier, doc.id!!).title
            log.debug("Migrate document: ${doc.uuid} with ${foundChildren.size} children")

            val newFolderId = createNewFolderFor(doc, title!!)
            val newFolder = documentService.docWrapperRepo.findById(newFolderId).get()
            doc.parent = newFolder
            doc.path += newFolderId
            documentService.docWrapperRepo.saveAndFlush(doc)
            documentService.aclService.updateParent(doc.id!!, newFolderId)

            // update path of all descendants
            replacePathIDinDescendants(catalogIdentifier, doc, doc.id!!, newFolderId)

            // update parent and parentIdentifier of children
            foundChildren.forEach { child ->
                child.wrapper.parent = newFolder
                documentService.docWrapperRepo.saveAndFlush(child.wrapper)
                documentService.aclService.updateParent(doc.id!!, newFolderId)

                // only set parentIdentifier if not already set. do not overwrite explicitly set parentIdentifier
                if (child.document.data.get("parentIdentifier") == null || child.document.data.get("parentIdentifier") is NullNode) {
                    child.document.data.set<TextNode>(
                        "parentIdentifier",
                        TextNode(doc.uuid),
                    )
                }
                documentService.docRepo.saveAndFlush(child.document)
            }

            transferRights(doc, newFolder, removeSourceDoc = false)
        }
        // save all groups again to update transferred rights
        saveAllGroupsOfCatalog(catalogIdentifier)
    }

    private fun replacePathIDinDescendants(catalogIdentifier: String, doc: DocumentWrapper, oldId: Int, newId: Int) {
        val children = documentService.findChildren(
            catalogIdentifier,
            doc.id,
        ).hits.map { it.wrapper }

        // no paths to update
        if (children.isEmpty()) return

        children.forEach { child ->
            child.path = child.path.map { if (it == oldId) newId else it }
            documentService.docWrapperRepo.saveAndFlush(child)
            // recursively update children
            replacePathIDinDescendants(catalogIdentifier, child, oldId, newId)
        }
    }

    private fun removeOldStructure(catalogIdentifier: String) {
        listOf(
            "Ausländische Vorhaben",
            "Vorgelagerte Verfahren",
            "Zulassungsverfahren",
            "Vorprüfungen, negativ",
        ).forEach { title ->
            val oldldBaseFolder = documentService.findChildren(
                catalogIdentifier,
                null,
            ).hits.find { it.document.title == title }
            val auth = SecurityContextHolder.getContext().authentication
            if (oldldBaseFolder != null) {
                documentService.deleteDocument(
                    auth as Principal,
                    catalogIdentifier,
                    oldldBaseFolder.wrapper.id!!,
                )
            }
        }
    }

    private fun migratePath(doc: DocumentWrapper) {
        val oldPath = doc.path // Style: [typeFolderId, FolderId, ...]
        // skip root folders
        if (oldPath.isEmpty()) return
        val reducedPath = oldPath.subList(1, oldPath.size) // Style: [FolderId, ...]
        val pathTitles = reducedPath.map {
            documentService.getDocumentByWrapperId(doc.catalog?.identifier!!, it).title!!
        }

        val newPath = createAndGetPathByTitles(pathTitles, doc.catalog!!.identifier)

        if (doc.type == "FOLDER") {
            // make sure folders with the same name and path are not saved more than once
            val folderWithSameNameAndPath = documentService.findChildren(
                doc.catalog!!.identifier,
                newPath.lastOrNull(),
            ).hits.find {
                it.document.title == documentService.getDocumentByWrapperId(doc.catalog?.identifier!!, doc.id!!).title
            }

            if (folderWithSameNameAndPath != null) {
                if (doc == folderWithSameNameAndPath.wrapper) {
                    // already transferred via parent node. only adjust path
                    doc.path = newPath
                    documentService.docWrapperRepo.saveAndFlush(doc)
                    return
                } else {
                    // doc gets replaced by folderWithSameNameAndPath so adjust permission in groups
                    transferRights(doc, folderWithSameNameAndPath.wrapper)
                }
                return
            }
        }

        doc.path = newPath
        doc.parent = if (newPath.isEmpty()) null else documentService.docWrapperRepo.findById(newPath.last()).get()
        // save
        documentService.aclService.updateParent(doc.id!!, newPath.lastOrNull())
        documentService.docWrapperRepo.saveAndFlush(doc)
    }

    private fun transferRights(
        sourceDoc: DocumentWrapper,
        targetDoc: DocumentWrapper,
        removeSourceDoc: Boolean = true,
    ) {
        groupService
            .getAll(sourceDoc.catalog!!.identifier)
            .forEach { group ->
                // if targetDoc already in group only remove sourceDoc. else replace
                val initialDocs = group.permissions?.documents ?: emptyList()
                val initialAdr = group.permissions?.addresses ?: emptyList()

                if (initialDocs.any { it.get("id").asInt() == sourceDoc.id!! } ||
                    initialAdr.any {
                        it.get("id").asInt() == sourceDoc.id!!
                    }
                ) {
                    group.permissions?.apply {
                        documents =
                            transformPermissions(initialDocs, targetDoc, sourceDoc, removeSourceDoc)
                        addresses =
                            transformPermissions(initialAdr, targetDoc, sourceDoc, removeSourceDoc)
                    }
                }
            }
    }

    /**
     * Transforms the permissions of a group by replacing the sourceDocId with the targetDocId. or just adding
     * the targetDocId if not already in permissions
     */
    private fun transformPermissions(
        initialDocs: List<JsonNode>,
        targetDoc: DocumentWrapper,
        sourceDoc: DocumentWrapper,
        removeSourceDoc: Boolean,
    ) = if (initialDocs.any { it.get("id").asInt() == targetDoc.id!! }) {
        if (removeSourceDoc) removeIDinPermissions(sourceDoc.id!!, initialDocs) else initialDocs
    } else {
        if (removeSourceDoc) {
            replaceIDinPermissions(
                sourceDoc.id!!,
                targetDoc.id!!,
                initialDocs,
            )
        } else {
            addIDinPermissions(sourceDoc.id!!, targetDoc.id!!, initialDocs)
        }
    }

    private fun replaceIDinPermissions(sourceId: Int, targetId: Int, permissions: List<JsonNode>): List<JsonNode> {
        return permissions.map {
            val docId = it.get("id").asInt()
            return@map (it as ObjectNode).put("id", if (docId == sourceId) targetId else docId)
        }
    }

    private fun addIDinPermissions(sourceId: Int, targetId: Int, permissions: List<JsonNode>): List<JsonNode> {
        val oldPerm = permissions.find { it.get("id").asInt() == sourceId } as ObjectNode? ?: return permissions
        val newPerm = oldPerm.deepCopy()
        newPerm.put("id", targetId)
        return permissions + listOf(newPerm)
    }

    private fun removeIDinPermissions(sourceId: Int, permissions: List<JsonNode>): List<JsonNode> = permissions.filter { it.get("id").asInt() != sourceId }

    private fun createAndGetPathByTitles(titles: List<String>, catalogIdentifier: String): MutableList<Int> {
        val auth = SecurityContextHolder.getContext().authentication
        val createdPathIds = mutableListOf<Int>()
        var parentId: Int? = null
        for (title in titles) {
            val foundChild = documentService.findChildren(
                catalogIdentifier,
                parentId,
            ).hits.filter { it.document.title == title }
            if (foundChild.isEmpty()) {
                // create new folder
                val folderData = jacksonObjectMapper().createObjectNode()
                    .put("_type", "FOLDER")
                    .put("_parent", parentId.toString())
                    .put("title", title)
                val document = convertToDocument(folderData)
                val folderDoc =
                    documentService.createDocument(auth as Principal, catalogIdentifier, document, parentId)
                documentService.docWrapperRepo.flush()

                parentId = folderDoc.wrapper.id!!
            } else {
                // found folder
                parentId = foundChild.first().wrapper.id!!
            }
            createdPathIds.add(parentId)
        }
        return createdPathIds
    }

    private fun initializeCatalogCodelistsAndQueries(catalogIdentifier: String) {
        val catalogType = catalogService.getCatalogById(catalogIdentifier).type
        catalogService.initializeCatalog(catalogIdentifier, catalogType)
    }

    private fun removePostMigrationInfo(catalogIdentifier: String) {
        entityManager
            .createQuery(
                "DELETE FROM VersionInfo version WHERE version.key = 'doPostMigrationFor' AND version.value = '$catalogIdentifier'",
            )
            .executeUpdate()
    }
}
