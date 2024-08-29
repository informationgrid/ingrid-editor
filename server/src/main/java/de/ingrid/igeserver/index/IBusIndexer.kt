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
package de.ingrid.igeserver.index

import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.utils.*
import org.apache.logging.log4j.kotlin.logger

class IBusIndexer(override val name: String, private val iBus: IBus) : IIndexManager {
    val log = logger()

    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String?): String? {
        val call = IngridCall()
        call.method = "getIndexNameFromAliasName"
        call.target = "__centralIndex__"
        call.parameter = mapOf(
            "indexAlias" to indexAlias,
            "partialName" to partialName,
        )

        val response = sendCallToIBus(iBus, call)
        return response?.getString("result")
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        val call = prepareCall("createIndex")
        call.parameter = mapOf(
            "name" to name,
            "type" to type,
            "esMapping" to esMapping,
            "esSettings" to esSettings,
        )

        val response = sendCallToIBus(iBus, call)
        return response != null && response.getBoolean("result")
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
        val call = prepareCall("switchAlias")
        val map = mapOf(
            "aliasName" to aliasName,
            "oldIndex" to oldIndex,
            "newIndex" to newIndex,
        )
        call.parameter = map

        sendCallToIBus(iBus, call)
    }

    override fun checkAndCreateInformationIndex() {
        val call = prepareCall("checkAndCreateInformationIndex")

        sendCallToIBus(iBus, call)
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument) {
        val call = prepareCall("update")
        call.parameter = mapOf(
            "indexinfo" to indexinfo,
            "doc" to doc,
            "updateOldIndex" to false,
        )

        sendCallToIBus(iBus, call)
    }

    override fun updateIPlugInformation(id: String, info: String) {
        val call = prepareCall("updateIPlugInformation")
        call.parameter = mapOf(
            "id" to id,
            "info" to info,
        )

        sendCallToIBus(iBus, call)
    }

    override fun flush() {
        val call = prepareCall("flush")
        sendCallToIBus(iBus, call)
    }

    override fun deleteIndex(index: String) {
        val call = prepareCall("deleteIndex")
        call.parameter = index

        sendCallToIBus(iBus, call)
    }

    override fun getIndices(filter: String): List<String> {
        val call = prepareCall("getIndices")
        call.parameter = filter

        val response = sendCallToIBus(iBus, call)
        @Suppress("UNCHECKED_CAST")
        return (response?.get("result") as Array<String>? ?: emptyArray<String>()).toList()
    }

    override fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        val call = prepareCall("deleteDocById")
        call.parameter = mapOf(
            "indexinfo" to indexinfo,
            "id" to id,
            "updateOldIndex" to updateOldIndex,
        )

        sendCallToIBus(iBus, call)
    }

    override fun indexExists(indexName: String): Boolean {
        val call = prepareCall("indexExists")
        call.parameter = indexName

        val response = sendCallToIBus(iBus, call)
        return (if (response != null) response["result"] else false) as Boolean
    }

    private fun prepareCall(method: String): IngridCall {
        val call = IngridCall()
        call.target = "__centralIndex__"
        call.method = method
        return call
    }

    private fun sendCallToIBus(iBus: IBus, call: IngridCall): IngridDocument? {
        try {
            return iBus.call(call)
        } catch (e: InterruptedException) {
            // deliver index cancellation up
            throw e
        } catch (e: Exception) {
            // TODO: log error for frontend!
            log.error("Error relaying index message: " + call.method, e)
            return null
        }
    }
}
