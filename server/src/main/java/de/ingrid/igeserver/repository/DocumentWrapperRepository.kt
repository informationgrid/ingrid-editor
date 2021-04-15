package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface DocumentWrapperRepository : JpaRepository<DocumentWrapper, Int> {
    
    @Query("SELECT case when d.draft is null then d.published else d.draft end from DocumentWrapper d where d.catalog.identifier = ?1 and d.category = ?2")
    fun findLatestInTitle(catalogId: String, category: String, query: String?): List<Document>
    
    @Query("SELECT case when d.draft.id is null then d.published.id else d.draft end from DocumentWrapper d")
    fun findLatestInTitle2(): List<Int>
    
    fun findByUuid(uuid: String): DocumentWrapper
    
    fun findAllByCatalog_IdentifierAndParentUuidAndCategory(
        catalog_identifier: String, parentUuid: String?, category: String
    ): List<DocumentWrapper>
    
//    fun getChildren(catalogId: String, parentId: String?)

}