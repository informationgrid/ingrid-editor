package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface CatalogRepository: JpaRepository<Catalog, Int> {
    fun findByIdentifier(identifier: String) : Catalog
    
    
    fun findAllByIdentifierAndDescription(identifier: String, description: String)
    
    @Query("SELECT e from Catalog e WHERE e.settings is not null$1", nativeQuery = true)
    fun specialSelection(text: String)
}