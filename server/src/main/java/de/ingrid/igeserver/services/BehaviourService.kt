/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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