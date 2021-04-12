package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import org.springframework.data.jpa.repository.JpaRepository

interface QueryRepository : JpaRepository<Query, Int> {
    fun findAllByCatalog(catalog: Catalog): List<Query>
}