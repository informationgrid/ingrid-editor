package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DocumentWrapperRepository : JpaRepository<DocumentWrapper, Int> {
    
//    @Query("SELECT case when d.draft is null then d.published else d.draft end from DocumentWrapper d where d.catalog.identifier = ?1 and d.category = ?2")
    @Query("""
        SELECT DISTINCT CAST(document1.data AS text)
            FROM document_wrapper
                     JOIN document document1 ON
                CASE
                    WHEN document_wrapper.draft IS NULL THEN document_wrapper.published = document1.id
                    ELSE document_wrapper.draft = document1.id
                    END
                , catalog
            WHERE document1.catalog_id = catalog.id AND catalog.identifier = '?1' AND category = '?2' AND title ILIKE '%?3%'
        """, nativeQuery = true)
    fun findLatestInTitle(catalogId: String, category: String, query: String?): List<Document>
    
    @Query("SELECT d from DocumentWrapper d where d.catalog.identifier = ?1")
    fun findLatestInTitle2(catalogId: String): List<DocumentWrapper>
    
    fun findByUuid(uuid: String): DocumentWrapper
    
    fun findAllByCatalog_IdentifierAndParent_UuidAndCategory(
        catalog_identifier: String, parentUuid: String?, category: String
    ): List<DocumentWrapper>
    
    fun findAllByCatalog_Identifier(catalog_identifier: String): List<DocumentWrapper>
    
    fun findAllByCatalog_IdentifierAndCategory(catalog_identifier: String, category: String): List<DocumentWrapper>
    
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.draft IS NOT NULL AND d.type != 'FOLDER'")
    fun findAllDrafts(catalogId: String): List<DocumentWrapper>
    
    @Query("SELECT d FROM DocumentWrapper d WHERE d.catalog.identifier = ?1 AND d.category = 'data' AND d.published IS NOT NULL AND d.type != 'FOLDER'")
    fun findAllPublished(catalogId: String): List<DocumentWrapper>
    
    fun countByParent_Uuid(parent_uuid: String): Long
    
    fun deleteByUuid(uuid: String)
    
//    fun getChildren(catalogId: String, parentId: String?)

}