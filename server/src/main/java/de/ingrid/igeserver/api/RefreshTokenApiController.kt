package de.ingrid.igeserver.api

import org.springframework.http.HttpStatus
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class RefreshTokenApiController : RefreshTokenApi {
    override fun refreshToken(): ResponseEntity<Void> {
        // do some magic!
        return ResponseEntity(HttpStatus.OK)
    }
}