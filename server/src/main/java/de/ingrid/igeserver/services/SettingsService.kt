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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.core.type.TypeReference
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.ElasticConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.IBusConfig
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Settings
import de.ingrid.igeserver.repository.SettingsRepository
import de.ingrid.utils.PlugDescription
import org.springframework.stereotype.Service

@Service
class SettingsService(
    val repoSettings: SettingsRepository
) {

//    private val objectDataTypes = listOf("default", "dsc_ecs", "metadata", "IDF_1.0")
    private val allCombinedDataTypes = listOf("default", "dsc_ecs", "metadata", "dsc_ecs_address", "address", "IDF_1.0")

    fun getIBusConfig(): List<IBusConfig> {
        val iBusJson = repoSettings.findByKey("ibus")?.value ?: return emptyList()

        return jacksonObjectMapper().convertValue(iBusJson, object : TypeReference<List<IBusConfig>>() {})
    }
    fun getElasticConfig(): List<ElasticConfig> {
        val iBusJson = repoSettings.findByKey("elasticsearch")?.value ?: return emptyList()

        return jacksonObjectMapper().convertValue(iBusJson, object : TypeReference<List<ElasticConfig>>() {})
    }

    fun setIBusConfig(config: List<IBusConfig>) {
        this.updateItem("ibus", config)
    }

    fun setElasticConfig(config: List<ElasticConfig>) {
        this.updateItem("elasticsearch", config)
    }

    fun getPlugDescription(partner: String?, provider: String?, plugId: String?, forAddress: Boolean, name: String): PlugDescription {
        val pd = PlugDescription().apply {
            put("useRemoteElasticsearch", true)
//            val datatypes = if (forAddress) allCombinedDataTypes else objectDataTypes
            allCombinedDataTypes.forEach { addDataType(it) }
            dataSourceName = name
            dataSourceDescription = "iPlug for indexing data of IGE-NG"
            proxyServiceURL = plugId
            iPlugClass = "de.ingrid.mdek.job.IgeSearchPlug"
            // the following fields are necessary for datasets to be shown on catalog page in portal
            if (forAddress) {
                addField("t02_address.id")
                addField("parent.address_node.addr_uuid")
            } else {
                addField("t01_object.id")
                addField("parent.object_node.obj_uuid")
            }
            if (partner != null) addPartner(partner)
            if (provider != null) addProvider(provider)
        }

        pd.md5Hash = ""
        val md5 = pd.hashCode().toString()

        return pd.apply { md5Hash = md5 }

    }
    
    fun <T> getItemAsList(key: String): List<T> {
        val iBusJson = repoSettings.findByKey(key)?.value ?: return emptyList()
        return jacksonObjectMapper().convertValue(iBusJson, object : TypeReference<List<T>>() {})
    }

    fun updateItem(key: String, value: Any) {
        val configFromDBOrNew = repoSettings.findByKey(key) ?: Settings().apply { this.key = key }
        configFromDBOrNew.value = value
        repoSettings.save(configFromDBOrNew)
    }
}
