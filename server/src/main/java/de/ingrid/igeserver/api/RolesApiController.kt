package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.Role
import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class RolesApiController : RolesApi {
    override fun createRole(id: String, role: Role): ResponseEntity<Void> {
        // do some magic!
        return ResponseEntity(HttpStatus.OK)
    }

    override fun deleteRole(id: String): ResponseEntity<Void> {
        // do some magic!
        return ResponseEntity(HttpStatus.OK)
    }

    override fun getRole(id: String): ResponseEntity<String> {
        return ResponseEntity.ok("{ \"id\": -1 }")
    }

    override fun listRoles(): ResponseEntity<String> {
        return ResponseEntity.ok("[]")
    }

    override fun updateRole(id: String, role: Role): ResponseEntity<Void> {
        // do some magic!
        return ResponseEntity(HttpStatus.OK)
    }
}