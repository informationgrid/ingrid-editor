package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying

interface CodelistRepository : JpaRepository<Codelist, Int> {
    
    fun findByCatalog_IdentifierAndIdentifier(catalog_identifier: String, identifier: String): Codelist
    
    fun findAllByCatalog_Identifier(catalog_identifier: String) : List<Codelist>
    
    @Modifying
    fun deleteByCatalog_IdentifierAndIdentifier(catalog_identifier: String, identifier: String)
    
}