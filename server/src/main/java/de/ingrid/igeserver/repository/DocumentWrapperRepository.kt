package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import org.springframework.data.domain.Page
import org.springframework.data.domain.Pageable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.JpaSpecificationExecutor
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param

interface DocumentWrapperRepository : JpaRepository<DocumentWrapper, Int>, JpaSpecificationExecutor<DocumentWrapper> {

    @Query(
        value = """SELECT DISTINCT dw1.*, document1.modified, document1.title
                FROM catalog, document_wrapper dw1
                         JOIN document document1 ON
                    CASE
                        WHEN dw1.draft IS NULL THEN dw1.published = document1.id
                        ELSE dw1.draft = document1.id
                        END
                WHERE (catalog.identifier = :catalogId AND catalog.id = document1.catalog_id AND dw1.category = :category
                AND document1.title ILIKE %:query%)
                """,
        countQuery = """SELECT DISTINCT count(dw1.*)
                FROM catalog, document_wrapper dw1
                         JOIN document document1 ON
                    CASE
                        WHEN dw1.draft IS NULL THEN dw1.published = document1.id
                        ELSE dw1.draft = document1.id
                        END
                WHERE (catalog.identifier = :catalogId AND catalog.id = document1.catalog_id AND dw1.category = :category
                AND document1.title ILIKE %:query%)
                """,
        nativeQuery = true
    )
    fun findComplex(
        @Param("catalogId") catalogId: String,
        @Param("category") category: String,
        @Param("query") query: String,
        pageable: Pageable
    ): Page<DocumentWrapper>

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
    
}