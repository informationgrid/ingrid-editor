package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.jpa.repository.JpaRepository

interface CatalogRepository : JpaRepository<Catalog, Int> {
    @Cacheable(value = ["catalog"])
    fun findByIdentifier(identifier: String): Catalog

    fun existsByIdentifier(identifier: String): Boolean

    fun findAllByType(type: String): List<Catalog>
}