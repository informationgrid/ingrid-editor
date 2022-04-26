package de.ingrid.igeserver.services

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Settings
import de.ingrid.igeserver.repository.SettingsRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class SettingsService @Autowired constructor(val repoSettings: SettingsRepository) {

    fun getIBusConfig(): List<IBusConfig> {
        val iBusJson = repoSettings.findByKey("ibus")?.value ?: return emptyList()

        val config = jacksonObjectMapper().convertValue(iBusJson, object : TypeReference<List<IBusConfig>>() {})
        return config
    }

    fun setIBusConfig(config: List<IBusConfig>) {
        val configFromDBOrNew = repoSettings.findByKey("ibus") ?: Settings().apply { key = "ibus" }
        configFromDBOrNew.value = config
        repoSettings.save(configFromDBOrNew)
    }
}
