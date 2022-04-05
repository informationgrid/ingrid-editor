package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize
import java.util.*

interface DocumentWrapperRepository : JpaRepository<DocumentWrapper, Int>, JpaSpecificationExecutor<DocumentWrapper> {

    @PostAuthorize("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(returnObject, 'READ')")
    override fun findById(id: Int): Optional<DocumentWrapper>

    @Query("SELECT dw FROM DocumentWrapper dw WHERE dw.id = ?1")
    fun findByIdNoPermissionCheck(id: Int): DocumentWrapper

    @PostAuthorize("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(returnObject, 'READ')")
    fun findByCatalog_IdentifierAndUuid(catalog_identifier: String, uuid: String): DocumentWrapper

    fun existsById(uuid: String): Boolean

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d")
    fun getAll(): List<DocumentWrapper?>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    fun findAllByCatalog_IdentifierAndParent_IdAndCategory(
        catalog_identifier: String, parentUuid: String?, category: String
    ): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    fun findByParent_id(parent_id: Int): List<DocumentWrapper>

    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.type != 'FOLDER' AND d.deleted != 1")
    fun findAllDocumentsByCatalog_Identifier(catalog_identifier: String): List<DocumentWrapper>

    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.deleted != 1")
    fun findAllDocumentsAndFoldersByCatalog_Identifier(catalog_identifier: String): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = ?2 AND d.deleted != 1")
    fun findAllByCatalog_IdentifierAndCategory(catalog_identifier: String, category: String): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.draft IS NOT NULL AND d.type != 'FOLDER' AND d.deleted != 1")
    fun findAllDrafts(catalogId: String): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.published IS NOT NULL AND d.type != 'FOLDER' AND d.deleted != 1" )
    fun findAllPublished(catalogId: String): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.pending IS NOT NULL AND d.type != 'FOLDER' AND d.deleted != 1" )
    fun findAllPending(catalogId: String): List<DocumentWrapper>

    @PreAuthorize("hasPermission(#uuid, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun deleteById(uuid: String)

    // allow if it's a new document, where id is null
    // then a permission check should be done before!
    @PreAuthorize("#docWrapper.id == null || hasPermission(#docWrapper, 'WRITE')")
    fun save(@Param("docWrapper") docWrapper: DocumentWrapper): DocumentWrapper

    @PreAuthorize("hasPermission(#docWrapper, 'WRITE')")
    fun saveAndFlush(@Param("docWrapper") docWrapper: DocumentWrapper): DocumentWrapper

}
