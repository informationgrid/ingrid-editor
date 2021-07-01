package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import org.springframework.data.domain.Sort
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface GroupRepository : JpaRepository<Group, Int> {
    
    fun findAllByCatalog_Identifier(catalog_identifier: String, sort: Sort = Sort.by(Sort.Direction.ASC, "name")): List<Group>
    
    fun findAllByCatalog_IdentifierAndId(catalog_identifier: String, id: Int): Group

    /**
     * This function needs to be overridden, otherwise a group is not deleted if the
     * currently logged in user belongs to this group.
     */
    @Modifying
    @Query("delete from Group g where g.id = ?1")
    override fun deleteById(id: Int)
    
}