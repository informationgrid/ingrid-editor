package de.ingrid.igeserver.services

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Settings
import de.ingrid.igeserver.repository.SettingsRepository
import de.ingrid.utils.PlugDescription
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class SettingsService @Autowired constructor(
    val repoSettings: SettingsRepository
) {

    private val objectDataTypes = listOf("default", "dsc_ecs", "metadata", "IDF_1.0")
    private val addressDataTypes = listOf("default", "dsc_ecs", "metadata", "dsc_ecs_address", "address", "IDF_1.0")
    
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

    fun getPlugDescription(partner: String?, provider: String?, plugId: String?, forAddress: Boolean): PlugDescription {
        val pd = PlugDescription().apply {
            put("useRemoteElasticsearch", true)
            val datatypes = if (forAddress) addressDataTypes else objectDataTypes
            datatypes.forEach { addDataType(it) }
            dataSourceName = "IGE-NG"
            dataSourceDescription = "iPlug for indexing data of IGE-NG"
            proxyServiceURL = plugId
            iPlugClass = "de.ingrid.mdek.job.IgeSearchPlug"
            if (partner != null) addPartner(partner)
            if (provider != null) addProvider(provider)
        }

        pd.md5Hash = ""
        val md5 = pd.hashCode().toString()

        return pd.apply { md5Hash = md5 }

    }
}
