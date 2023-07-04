package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import org.springframework.data.jpa.repository.JpaRepository

interface CatalogRepository : JpaRepository<Catalog, Int> {
    // TODO: when caching then we might get a detached entity error if the cached value is used as a reference
    //       in another entity. In this case we should call merge-method of the entityManager.
//    @Cacheable(value = ["catalog"])
    fun findByIdentifier(identifier: String): Catalog

    fun existsByIdentifier(identifier: String): Boolean

    fun findAllByType(type: String): List<Catalog>
}