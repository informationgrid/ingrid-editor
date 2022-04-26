package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.FrontendConfiguration
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.services.SettingsService
import org.springframework.beans.factory.annotation.Autowired
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

    @Autowired
    lateinit var settingsService: SettingsService

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

    override fun getIBus(): ResponseEntity<List<IBusConfig>> {

        return ResponseEntity.ok().body(
            settingsService.getIBusConfig()
        )

    }

    override fun setIBus(config: List<IBusConfig>): ResponseEntity<Unit> {

        settingsService.setIBusConfig(config)
        return ResponseEntity.ok().build()

    }


}
