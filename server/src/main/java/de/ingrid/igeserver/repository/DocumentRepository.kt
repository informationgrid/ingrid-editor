package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PreAuthorize

interface DocumentRepository : JpaRepository<Document, Int> {

    @Modifying
    @PreAuthorize("hasPermission(#uuid, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun deleteAllByUuid(uuid: String)

    @PreAuthorize("#document.id == null || hasPermission(#document.wrapperId, 'de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper', 'WRITE')")
    fun save(@Param("document") document: Document): Document
}
