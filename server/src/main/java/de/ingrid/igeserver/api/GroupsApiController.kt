package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Group
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class GroupsApiController : GroupsApi {
    override fun createGroup(id: String, group: Group): ResponseEntity<Void> {
        // do some magic!
        return ResponseEntity(HttpStatus.OK)
    }

    override fun deleteGroup(id: String): ResponseEntity<Void> {
        // do some magic!
        return ResponseEntity(HttpStatus.OK)
    }

    override fun getGroup(id: String): ResponseEntity<String> {
        return ResponseEntity.ok("{ \"id\": -1 }")
    }

    override fun listGroups(): ResponseEntity<String> {
        return ResponseEntity.ok("[]")
    }

    override fun updateGroup(id: String, group: Group): ResponseEntity<Void> {
        // do some magic!
        return ResponseEntity(HttpStatus.OK)
    }
}
