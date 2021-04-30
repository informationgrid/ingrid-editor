package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying

interface DocumentRepository : JpaRepository<Document, Int> {

    @Modifying
    fun deleteAllByUuid(uuid: String)
    
}