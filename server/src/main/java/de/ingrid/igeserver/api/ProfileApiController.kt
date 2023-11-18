package de.ingrid.igeserver.api

import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.CatalogService
import jakarta.annotation.Generated
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController
import java.security.Principal

@Generated(value = ["io.swagger.codegen.languages.SpringCodegen"], date = "2017-08-21T10:21:42.666Z")
@RestController
@RequestMapping(path = ["/api"])
class ProfileApiController : ProfileApi {

    private val log = logger()

    @Autowired
    private lateinit var catalogService: CatalogService

    override fun getProfiles(principal: Principal?): ResponseEntity<List<CatalogProfile>> {
        val catProfiles = catalogService.getAvailableCatalogProfiles()
        return ResponseEntity.ok(catProfiles)
    }

}