/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.api

import de.ingrid.igeserver.index.IBusIndexManager
import de.ingrid.igeserver.model.CMSPage
import de.ingrid.igeserver.model.FrontendConfiguration
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ConnectionConfig
import de.ingrid.igeserver.services.IBusService
import de.ingrid.igeserver.services.SettingsService
import de.ingrid.utils.PlugDescription
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.beans.factory.annotation.Value
import org.springframework.http.ResponseEntity
import org.springframework.web.bind.annotation.RequestMapping
import org.springframework.web.bind.annotation.RestController

@RestController
@RequestMapping(path = ["/api"])
class ConfigApiController(
    val settingsService: SettingsService,
    val iBusIndexManager: IBusIndexManager
) : ConfigApi {

    @Autowired(required = false)
    var iBusService: IBusService? = null

    @Value("\${keycloak.auth-server-url-frontend}")
    lateinit var keycloakUrlFrontend: String

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
                keycloakUrl = keycloakUrlFrontend,
                keycloakRealm = keycloakRealm,
                keycloakClientId = keycloakClientId,
                keycloakEnabled = keycloakEnabled,
                supportEmail = supportEmail
            )
        )

    }

    override fun getConnections(): ResponseEntity<ConnectionConfig> {
        return ResponseEntity.ok().body(
            ConnectionConfig(
                settingsService.getIBusConfig(),
                settingsService.getElasticConfig(),
            )
        )
    }

    override fun isConnected(index: Int): ResponseEntity<Boolean> {
        return ResponseEntity.ok().body(
            iBusService?.isConnected(index)
        )
    }

    override fun setConnections(config: ConnectionConfig): ResponseEntity<Unit> {
        config.ibus?.let {
            settingsService.setIBusConfig(it)
            iBusService?.setupConnections()
            iBusIndexManager.configure(PlugDescription())
//            iBusService?.restartCommunication()
        }
        config.elasticsearch?.let {settingsService.setElasticConfig(it)}
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
