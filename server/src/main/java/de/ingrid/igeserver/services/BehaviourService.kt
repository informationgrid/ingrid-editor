package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.repository.BehaviourRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class BehaviourService @Autowired constructor(
    private val behaviourRepo: BehaviourRepository
) {

    fun get(catalogId: String): List<Behaviour> {
        return behaviourRepo.findAllByCatalog_Identifier(catalogId)
    }

    fun save(catalogId: String, behaviours: List<Behaviour>) {
        val allBehaviours = get(catalogId)
        
        behaviours.forEach { behaviour -> behaviour.id = allBehaviours.find { it.name == behaviour.name }?.id }
        behaviourRepo.saveAll(behaviours)
    }

}