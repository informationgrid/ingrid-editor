package de.ingrid.igeserver.api

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.CatalogService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@RestController
@RequestMapping(path = ["/api"])
class BehavioursApiController : BehavioursApi {

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
