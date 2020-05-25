package de.ingrid.igeserver.api

import de.ingrid.igeserver.db.DBApi
import de.ingrid.igeserver.model.Behaviour
import de.ingrid.igeserver.services.MapperService
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.igeserver.utils.DBUtils
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
    lateinit var dbUtils: DBUtils

    @Autowired
    lateinit var authUtils: AuthUtils

    @Throws(ApiException::class)
    override fun getBehaviours(principal: Principal?): ResponseEntity<List<Behaviour>> {

        val userId = authUtils.getUsernameFromPrincipal(principal)
        val dbId = dbUtils.getCurrentCatalogForUser(userId)

        dbService.acquire(dbId).use {
            val behaviours = dbService.findAll(DBApi.DBClass.Behaviours.name)
            val result = behaviours
                    .map {
                        Behaviour(
                                _id = it.get("_id").asText(),
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

        val userId = authUtils.getUsernameFromPrincipal(principal)
        val dbId = dbUtils.getCurrentCatalogForUser(userId)

        dbService.acquire(dbId).use {
            for (behaviour in behaviours) {
                val rid = dbService.getRecordId("Behaviours", behaviour._id)
                dbService.save("Behaviours", rid, MapperService.getJsonNodeFromClass(behaviour))
            }
            return ResponseEntity.ok().build()
        }

    }

}