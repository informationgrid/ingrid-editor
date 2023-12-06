package de.ingrid.igeserver.services

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.repository.BehaviourRepository
import de.ingrid.igeserver.repository.CatalogRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class BehaviourService(
    private val behaviourRepo: BehaviourRepository,
    private val catalogRepo: CatalogRepository
) {

    fun get(catalogId: String): List<Behaviour> {
        return behaviourRepo.findAllByCatalog_Identifier(catalogId)
    }

    fun get(catalogId: String, behaviourId: String): Behaviour? = get(catalogId).find { it.name == behaviourId }

    fun save(catalogId: String, behaviours: List<Behaviour>) {
        val allBehaviours = get(catalogId)
        val catalog = catalogRepo.findByIdentifier(catalogId)
        
        behaviours.forEach { behaviour ->
            run {
                behaviour.id = allBehaviours.find { it.name == behaviour.name }?.id
                behaviour.catalog = catalog
            }
        }
        behaviourRepo.saveAll(behaviours)
    }

}