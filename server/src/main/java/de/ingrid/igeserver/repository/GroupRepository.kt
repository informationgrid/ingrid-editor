package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository

interface GroupRepository : JpaRepository<Group, Int> {
    
    fun findAllByCatalog_Identifier(catalog_identifier: String, sort: Sort = Sort.by(Sort.Direction.ASC, "name")): List<Group>
    
    fun findAllByCatalog_IdentifierAndId(catalog_identifier: String, id: Int): Group
    
}