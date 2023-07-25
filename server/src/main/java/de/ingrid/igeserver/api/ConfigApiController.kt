package de.ingrid.igeserver.api

import de.ingrid.igeserver.model.CMSPage
import de.ingrid.igeserver.model.FrontendConfiguration
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.services.IBusService
import de.ingrid.igeserver.services.SettingsService
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class ConfigApiController @Autowired constructor(
    val settingsService: SettingsService
) : ConfigApi {

    @Autowired(required = false)
    var iBusService: IBusService? = null

    @Value("\${keycloak.auth-server-url}")
    lateinit var keycloakUrl: String

    @Value("\${keycloak.realm}")
    lateinit var keycloakRealm: String

    @Value("\${frontend.keycloak.resource}")
    lateinit var keycloakClientId: String

    @Value("\${frontend.support-email}")
    lateinit var supportEmail: String

    @Value("\${frontend.keycloak.enable}")
    var keycloakEnabled: Boolean = true


    override fun get(): ResponseEntity<FrontendConfiguration> {

        return ResponseEntity.ok().body(
            FrontendConfiguration(
                keycloakUrl = keycloakUrl,
                keycloakRealm = keycloakRealm,
                keycloakClientId = keycloakClientId,
                keycloakEnabled = keycloakEnabled,
                supportEmail = supportEmail
            )
        )

    }

    override fun getIBus(): ResponseEntity<List<IBusConfig>> {
        return ResponseEntity.ok().body(
            settingsService.getIBusConfig()
        )
    }

    override fun isConnected(index: Int): ResponseEntity<Boolean> {
        return ResponseEntity.ok().body(
            iBusService?.isConnected(index)
        )
    }

    override fun setIBus(config: List<IBusConfig>): ResponseEntity<Unit> {

        settingsService.setIBusConfig(config)
        iBusService?.restartCommunication()
        return ResponseEntity.ok().build()

    }

    override fun getCMSPages(): ResponseEntity<List<LinkedHashMap<String, String>>> {
        val cms = settingsService.getItemAsList<LinkedHashMap<String,String>>("cms")
        return ResponseEntity.ok(cms)
    }

    override fun updateCMS(pages: List<CMSPage>): ResponseEntity<Unit> {
        this.settingsService.updateItem("cms", pages)
        return ResponseEntity.ok().build()
    }

}
