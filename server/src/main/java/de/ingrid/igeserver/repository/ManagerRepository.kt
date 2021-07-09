package de.ingrid.igeserver.repository

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.AssignmentKey
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.CatalogManagerAssignment
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface ManagerRepository : JpaRepository<CatalogManagerAssignment, Int> {
    fun findByUserAndCatalogIdentifier(user: UserInfo, catalog_identifier: String): CatalogManagerAssignment?


}
