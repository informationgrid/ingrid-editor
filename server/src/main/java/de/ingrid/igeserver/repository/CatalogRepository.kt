package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.data.jpa.repository.JpaRepository

interface CatalogRepository: JpaRepository<Catalog, Int> {
    fun findByIdentifier(identifier: String) : Catalog
}