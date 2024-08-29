/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.index.ElasticIndexer
import de.ingrid.igeserver.index.IBusIndexer
import de.ingrid.igeserver.index.IIndexManager
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ElasticConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import org.springframework.stereotype.Service

@Service
class ConnectionService(
    private val iBusService: IBusService,
    private val elasticsearchService: ElasticsearchService,
    private val settingsService: SettingsService,
) {
    fun getIndexerForConnection(id: String): IIndexManager {
        return when (val connection = settingsService.getConnectionConfig(id)) {
            is IBusConfig -> IBusIndexer(connection.name, iBusService.getIBus(id))
            is ElasticConfig -> ElasticIndexer(
                connection.name,
                elasticsearchService.getClient(id),
            )
            else -> throw ServerException.withReason("Unknown Connection-Config Class: ${connection?.javaClass}")
        }
    }

    private fun getConnectionService(id: String): IConnection {
        return if (iBusService.containsId(id)) {
            iBusService
        } else if (elasticsearchService.containsId(id)) {
            elasticsearchService
        } else {
            throw ServerException.withReason("Connection-ID not found: $id")
        }
    }

    fun isConnected(id: String): Boolean {
        return getConnectionService(id).isConnected(id)
    }

    fun setupConnections() {
        iBusService.setupConnections()
        elasticsearchService.setupConnections()
    }
}
