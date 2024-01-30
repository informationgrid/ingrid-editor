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
package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.DOCUMENT_STATE
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import java.util.*

interface DocumentWrapperRepository : JpaRepository<DocumentWrapper, Int>, JpaSpecificationExecutor<DocumentWrapper> {

    @PostAuthorize("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(returnObject, 'READ')")
    override fun findById(id: Int): Optional<DocumentWrapper>

    @Query("SELECT dw FROM DocumentWrapper dw WHERE dw.id = ?1")
    fun findByIdNoPermissionCheck(id: Int): DocumentWrapper

    @PostAuthorize("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(returnObject, 'READ')")
    fun findByCatalog_IdentifierAndUuid(catalog_identifier: String, uuid: String): DocumentWrapper

    @PostAuthorize("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(returnObject, 'READ')")
    fun findAllByCatalog_IdentifierAndResponsibleUser_Id(catalog_identifier: String, responsibleUser_id: Int): List<DocumentWrapper>

    @PostAuthorize("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(returnObject, 'READ')")
    @Query("SELECT dw.*, 0 as countChildren FROM document_wrapper dw JOIN catalog cat ON dw.catalog_id = cat.id WHERE cat.identifier = ?1 AND dw.uuid = ?2", nativeQuery = true )
    fun findByCatalogAndUuidIncludingDeleted(catalogIdentifier: String, uuid: String): DocumentWrapper

    @PostFilter("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d")
    fun getAll(): List<DocumentWrapper?>
    
    @Deprecated("Is not secured")
    @Query("SELECT d.parent FROM DocumentWrapper d WHERE d.id = ?1")
    fun getParentWrapper(id: Int): DocumentWrapper?

    // TODO: add permission check
    @Deprecated("Is not secured")
    @Query("SELECT d, dw.id as wrapperId FROM DocumentWrapper dw JOIN Document d ON dw.uuid = d.uuid WHERE dw.deleted = 0 AND d.catalog.identifier = ?1 AND dw.catalog.identifier = ?1 AND d.uuid = ?2 AND d.state = ?3")
    fun getDocumentByState(catalogIdentifier: String, uuid: String, state: DOCUMENT_STATE): Array<Any>

    @PostFilter("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(filterObject, 'READ')")
    fun findAllByCatalog_IdentifierAndParent_IdAndCategory(
        catalog_identifier: String, parentUuid: Int?, category: String
    ): List<DocumentWrapper>

    @PostFilter("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(filterObject, 'READ')")
    fun findByParent_id(parent_id: Int): List<DocumentWrapper>

    @Query("SELECT dw.id FROM document_wrapper dw, document doc WHERE dw.uuid = doc.uuid AND dw.parent_id = ?1 AND (doc.state = 'PUBLISHED' OR doc.type = 'FOLDER')", nativeQuery = true)
    fun findByParentIdAndPublished(parentId: Int): List<Int>

    @Deprecated("Is not secured")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.type != 'FOLDER' AND d.deleted != 1")
    fun findAllDocumentsByCatalog_Identifier(catalog_identifier: String): List<DocumentWrapper>

    @Deprecated("Is not secured")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.deleted != 1")
    fun findAllDocumentsAndFoldersByCatalog_Identifier(catalog_identifier: String): List<DocumentWrapper>

    @PostFilter("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = ?2 AND d.deleted != 1")
    fun findAllByCatalog_IdentifierAndCategory(catalog_identifier: String, category: String): List<DocumentWrapper>

    @PostFilter("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(filterObject, 'READ')")
//    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.draft IS NOT NULL AND d.type != 'FOLDER' AND d.deleted != 1")
    @Query("SELECT dw FROM DocumentWrapper dw, Document d WHERE dw.uuid = d.uuid AND d.isLatest = true AND d.catalog.identifier = ?1 AND dw.category = 'data' AND (d.state = 'DRAFT' OR d.state = 'DRAFT_AND_PUBLISHED') AND d.type != 'FOLDER' AND dw.deleted != 1")
    fun findAllDrafts(catalogId: String): List<DocumentWrapper>

    @PostFilter("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(filterObject, 'READ')")
//    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.published IS NOT NULL AND d.type != 'FOLDER' AND d.deleted != 1" )
    @Query("SELECT dw FROM DocumentWrapper dw, Document d WHERE dw.uuid = d.uuid AND d.isLatest = true AND d.catalog.identifier = ?1 AND dw.category = 'data' AND d.state = 'PUBLISHED' AND d.type != 'FOLDER' AND dw.deleted != 1")
    fun findAllPublished(catalogId: String): List<DocumentWrapper>

    @PostFilter("hasAnyAuthority('ROLE_cat-admin', 'ROLE_ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT dw FROM DocumentWrapper dw JOIN Document doc ON dw.uuid = doc.uuid WHERE dw.catalog.identifier = ?1 AND dw.category = 'data' AND doc.state = 'PENDING' AND dw.type != 'FOLDER' AND dw.deleted = 0" )
    fun findAllPending(catalogId: String): List<DocumentWrapper>

    @PreAuthorize("hasPermission(#id, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    override fun deleteById(id: Int)

    @Modifying
    @PreAuthorize("hasPermission(#id, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    @Query("UPDATE document_wrapper SET deleted = 0 WHERE id = ?1", nativeQuery = true )
    fun undeleteDocument(wrapperId: Int)

    // allow if it's a new document, where id is null
    // then a permission check should be done before!
    @PreAuthorize("#docWrapper.id == null || hasPermission(#docWrapper, 'WRITE')")
    fun save(@Param("docWrapper") docWrapper: DocumentWrapper): DocumentWrapper

    @PreAuthorize("hasPermission(#docWrapper, 'WRITE')")
    fun saveAndFlush(@Param("docWrapper") docWrapper: DocumentWrapper): DocumentWrapper

}
