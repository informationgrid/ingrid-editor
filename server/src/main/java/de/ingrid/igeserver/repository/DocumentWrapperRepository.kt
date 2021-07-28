package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PostAuthorize
import org.springframework.security.access.prepost.PostFilter
import org.springframework.security.access.prepost.PreAuthorize

interface DocumentWrapperRepository : JpaRepository<DocumentWrapper, Int>, JpaSpecificationExecutor<DocumentWrapper> {

    @PostAuthorize("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(returnObject, 'READ')")
    fun findById(uuid: String): DocumentWrapper

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    fun findAllByCatalog_IdentifierAndParent_IdAndCategory(
        catalog_identifier: String, parentUuid: String?, category: String
    ): List<DocumentWrapper>
    
    fun findByDraftUuidOrPublishedUuid(draft_uuid: String, published_uuid: String): DocumentWrapper

    fun findAllByCatalog_Identifier(catalog_identifier: String): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    fun findAllByCatalog_IdentifierAndCategory(catalog_identifier: String, category: String): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.draft IS NOT NULL AND d.type != 'FOLDER'")
    fun findAllDrafts(catalogId: String): List<DocumentWrapper>

    @PostFilter("hasAnyRole('cat-admin', 'ige-super-admin') || hasPermission(filterObject, 'READ')")
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.published IS NOT NULL AND d.type != 'FOLDER'")
    fun findAllPublished(catalogId: String): List<DocumentWrapper>

    fun countByParent_Id(parent_uuid: String): Long

    @PreAuthorize("hasPermission(#uuid, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun deleteById(uuid: String)

    @PreAuthorize("hasPermission(#docWrapper, 'WRITE')")
    fun save(@Param("docWrapper") docWrapper: DocumentWrapper): DocumentWrapper

}
