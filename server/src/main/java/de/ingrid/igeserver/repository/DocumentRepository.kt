package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PreAuthorize

interface DocumentRepository : JpaRepository<Document, Int> {

    @Modifying
    @PreAuthorize("hasPermission(#uuid, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun deleteAllByUuid(uuid: String)

    @PreAuthorize("#document.id == null || hasPermission(#document.wrapperId, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun save(@Param("document") document: Document): Document

    /**
     * Replace matching reference text from all draft and published versions that:
     *   - are not deleted
     *   - belong to the catalog
     *   - belong to category 'data'
     *   - contain the address reference to be replaced in the jsonb as text content
     * The selector should be strong enough. If the string "ref": "<UUID>" appears somewhere else
     * in the document, then it'll be also replaced!
     * This function is only allowed for catalog administrators and above, since documents might be changed
     * an author does not have access to.
     */
    @PreAuthorize("hasAnyRole('cat-admin', 'ige-super-admin')")
    @Query(
        """
        UPDATE document
            SET data = replace(data::text, '"ref": "?2"',
               '"ref": "?3"')::jsonb
            WHERE id IN (SELECT doc.id as docId
                 FROM catalog,
                      document_wrapper dw, document doc
                 WHERE dw.catalog_id = catalog.id AND catalog.identifier = ?1 AND dw.deleted = 0
                   AND (dw.published = doc.id OR dw.draft = doc.id)
                   AND dw.category = 'data'
                   AND doc.data::text ilike '%"ref": "?2"%')
        """, nativeQuery = true
    )
    fun replaceReference(catalogId: String, source: String, target: String)
}
