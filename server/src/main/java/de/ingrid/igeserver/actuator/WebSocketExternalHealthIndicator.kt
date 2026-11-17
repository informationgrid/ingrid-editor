/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.actuator

import org.springframework.beans.factory.annotation.Value
import org.springframework.boot.health.contributor.Health
import org.springframework.boot.health.contributor.HealthIndicator
import org.springframework.messaging.simp.stomp.StompSessionHandlerAdapter
import org.springframework.stereotype.Component
import org.springframework.web.socket.client.standard.StandardWebSocketClient
import org.springframework.web.socket.messaging.WebSocketStompClient
import java.util.concurrent.TimeUnit

@Component
class WebSocketExternalHealthIndicator(
    @Value("\${app.host}") externalUrl: String,
) : HealthIndicator {

    private val externalUrl = externalUrl
        .replace("https://", "wss://")
        .replace("http://", "ws://")
        .let { if (it.endsWith("/")) "${it}ws" else "$it/ws" }

    override fun health(): Health {
        val client = WebSocketStompClient(StandardWebSocketClient())

        return try {
            // Wir nutzen den Future-Aufruf und begrenzen ihn auf 2 Sekunden
            val session = client.connectAsync(externalUrl, object : StompSessionHandlerAdapter() {})
                .get(2, TimeUnit.SECONDS)

            if (session.isConnected) {
                session.disconnect()
                Health.up()
                    .withDetail("url", externalUrl)
                    .withDetail("status", "Handshake successful")
                    .build()
            } else {
                Health.down().withDetail("error", "Session created but not connected").build()
            }
        } catch (e: Exception) {
            // Fängt Timeouts, Connection Refused oder SSL-Fehler ab
            Health.down()
                .withDetail("url", externalUrl)
                .withDetail("cause", e.message ?: "Unknown error")
                .build()
        }
    }
}
