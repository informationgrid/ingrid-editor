package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.FrontendConfiguration
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class ConfigApiController : ConfigApi {

    @Value("\${keycloak.auth-server-url}")
    lateinit var keycloakUrl: String

    @Value("\${keycloak.realm}")
    lateinit var keycloakRealm: String

    @Value("\${frontend.keycloak.resource}")
    lateinit var keycloakClientId: String

    @Value("\${frontend.keycloak.enable}")
    var keycloakEnabled: Boolean = true

    override fun get(): ResponseEntity<FrontendConfiguration> {

        return ResponseEntity.ok().body(
            FrontendConfiguration(
                keycloakUrl = keycloakUrl,
                keycloakRealm = keycloakRealm,
                keycloakClientId = keycloakClientId,
                keycloakEnabled = keycloakEnabled
            )
        )

    }


}
