package de.ingrid.igeserver.api

import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.meta.BehaviourType
import de.ingrid.igeserver.model.Behaviour
import de.ingrid.igeserver.services.MapperService
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
    lateinit var dbService: DBApi

    @Autowired
    lateinit var catalogService: CatalogService

    @Autowired
    lateinit var mapperService: MapperService

    @Throws(ApiException::class)
    override fun getBehaviours(principal: Principal?): ResponseEntity<List<Behaviour>> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            val behaviours = dbService.findAll(BehaviourType::class)!!
            val result = behaviours
                    .map {
                        Behaviour(
                                _id = it!!.get("_id").asText(),
                                active = it.get("active").asBoolean(),
                                data = it.get("data"))
                    }

            return ResponseEntity.ok(result)
        }

    }

    @Throws(Exception::class)
    override fun setBehaviours(
            principal: Principal?,
            behaviours: List<Behaviour>): ResponseEntity<Void> {

        val dbId = catalogService.getCurrentCatalogForPrincipal(principal)

        dbService.acquire(dbId).use {
            for (behaviour in behaviours) {
                val rid = dbService.getRecordId(BehaviourType::class, behaviour._id)
                dbService.save(BehaviourType::class, rid, mapperService.getJsonNodeFromClass(behaviour))
            }
            return ResponseEntity.ok().build()
        }

    }

}