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
package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.databind.node.ArrayNode
import com.fasterxml.jackson.databind.node.NullNode
import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.databind.node.TextNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.api.TagRequest
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.ingrid_baw.BawProfile
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.utils.convertToDocument
import jakarta.persistence.EntityManager
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager
import java.security.Principal

@Component
class PostMigrationTask(
    entityManager: EntityManager,
    transactionManager: PlatformTransactionManager,
    val catalogService: CatalogService,
    val groupService: GroupService,
    val documentService: DocumentService,
    val docRepo: DocumentRepository,
    val aclService: IgeAclService,
    val codelistHandler: CodelistHandler,
    val fixPathsTask: FixPathsTask,
    val enhanceGroupsTask: EnhanceGroupsTask,
    val saveGroupsTask: SaveGroupsTask,
) : DbTriggeredTask(entityManager, transactionManager) {

    override val taskKey = "doPostMigrationFor"

    override fun executeTaskOnCatalog(catalogIdentifier: String) = doPostMigration(catalogIdentifier)

    private fun doPostMigration(catalogIdentifier: String) {
        // Warning: Execution Order is important
        saveGroupsTask.saveAllGroupsOfCatalog(catalogIdentifier)
        initializeCatalogCodelistsAndQueries(catalogIdentifier)
        restructureObjectsWithChildren(catalogIdentifier)
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

    private fun createNewFolderFor(
        migratedObject: DocumentWrapper,
        title: String,
    ): Int {
        val auth = SecurityContextHolder.getContext().authentication
        val catalogIdentifier = migratedObject.catalog!!.identifier
        val folderData = jacksonObjectMapper().createObjectNode().put("title", title)

        val document = convertToDocument(folderData, docType = "FOLDER")
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

    private fun restructureObjectsWithChildren(catalogIdentifier: String) {
        if (catalogService.getCatalogById(catalogIdentifier).type == BawProfile.ID) {
            log.info("No restructuring of objects with children for catalogs with BAW-Profile: $catalogIdentifier")
            return
        }
        documentService.getAllDataDocumentWrappers(catalogIdentifier, includeFolders = false).forEach { doc ->
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
                documentService.aclService.updateParent(child.wrapper.id!!, newFolderId)

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
        saveGroupsTask.saveAllGroupsOfCatalog(catalogIdentifier)
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

    private fun initializeCatalogCodelistsAndQueries(catalogIdentifier: String) {
        val catalogType = catalogService.getCatalogById(catalogIdentifier).type
        catalogService.initializeCatalog(catalogIdentifier, catalogType)
    }
}
