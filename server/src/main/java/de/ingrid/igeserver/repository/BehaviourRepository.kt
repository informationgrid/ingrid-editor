package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import org.springframework.data.jpa.repository.JpaRepository

interface BehaviourRepository : JpaRepository<Behaviour, Int> {

    fun findAllByCatalog_Identifier(catalog_identifier: String): List<Behaviour>
    
}