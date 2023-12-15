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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import org.apache.logging.log4j.kotlin.Logging
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class BehavioursApiController : BehavioursApi, Logging {

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var behaviourService: BehaviourService

    override fun getBehaviours(principal: Principal): ResponseEntity<List<Behaviour>> {
        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        val result = this.behaviourService.get(catalogId)
        return ResponseEntity.ok(result)
    }

    override fun setBehaviours(
        principal: Principal,
        behaviours: List<Behaviour>
    ): ResponseEntity<Void> {

        val catalogId = catalogService.getCurrentCatalogForPrincipal(principal)

        behaviourService.save(catalogId, behaviours)
        return ResponseEntity.ok().build()
    }
}
