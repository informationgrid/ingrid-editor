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
package de.ingrid.igeserver.index

import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.directus.DirectusClient
import de.ingrid.igeserver.services.directus.DirectusImportMode
import org.apache.logging.log4j.kotlin.logger
import tools.jackson.core.type.TypeReference
import tools.jackson.module.kotlin.jacksonObjectMapper

/**
 * Index target for the "Directus Push-Schnittstelle" (UmweltNAVI Ingest API).
 *
 * A complete indexing (signaled by [createIndex], which is only called in the pre-phase of a full indexing)
 * is transferred as a "full" import session, so that the server removes all records not sent anymore.
 * Single updates and deletes are transferred in an "incremental" import session, which is committed on [flush].
 */
class DirectusIndexer(
    override val name: String,
    private val client: DirectusClient,
    private val batchSize: Int = 100,
) : IIndexManager {

    private val log = logger()
    private val mapper = jacksonObjectMapper()

    private var fullImport = false
    private var importId: String? = null
    private val upserts = mutableListOf<Map<String, Any?>>()
    private val deletes = mutableListOf<Map<String, Any?>>()

    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String?): String = client.getName()

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean {
        abortOpenImport()
        fullImport = true
        return true
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String): Unit = Unit

    override fun checkAndCreateInformationIndex(): Unit = Unit

    override fun update(indexinfo: IndexInfo, docAny: Any) {
        val doc: MutableMap<String, Any?> = mapper.readValue(docAny.toString(), object : TypeReference<MutableMap<String, Any?>>() {})
        val docId = indexinfo.docIdField?.let { doc[it] }
        if (doc["isfolder"]?.toString() == "true") {
            throw IndexException.skipFolders(docId?.toString() ?: doc["id"].toString())
        }
        if (doc["id"] == null) {
            doc["id"] = docId ?: throw IndexException.withReason("Could not find id field in document")
        }

        upserts.add(doc)
        sendIfBatchFull()
    }

    override fun delete(indexinfo: IndexInfo, uuid: String, updateOldIndex: Boolean) {
        deletes.add(mapOf("id" to uuid))
        sendIfBatchFull()
    }

    override fun onFinishIndexAll() {
        if (!fullImport) return

        // a full import without any documents is also committed, so that all records are removed
        sendOperations()
        client.commit(ensureImportStarted())
        reset()
    }

    override fun flush() {
        if (importId == null && upserts.isEmpty() && deletes.isEmpty()) {
            fullImport = false
            return
        }

        if (fullImport) {
            // a full import was not finished correctly (onFinishIndexAll was not called),
            // so we must not commit it, since this would remove all records not sent yet
            log.warn("Directus '$name': Full import was not finished correctly and will be aborted")
            abortOpenImport()
            fullImport = false
            return
        }

        sendOperations()
        client.commit(ensureImportStarted())
        reset()
    }

    override fun updateIPlugInformation(id: String, info: String): Unit = Unit

    override fun deleteIndex(index: String): Unit = Unit

    override fun getIndices(filter: String): List<String> = emptyList()

    override fun indexExists(indexName: String): Boolean = true

    override fun getCategories(): List<DocumentCategory> = listOf(DocumentCategory.DATA)

    private fun sendIfBatchFull() {
        if (upserts.size + deletes.size >= batchSize) sendOperations()
    }

    private fun sendOperations() {
        if (upserts.isEmpty() && deletes.isEmpty()) return

        client.sendOperations(ensureImportStarted(), upserts.toList(), deletes.toList())
        upserts.clear()
        deletes.clear()
    }

    private fun ensureImportStarted(): String = importId
        ?: client.startImport(if (fullImport) DirectusImportMode.FULL else DirectusImportMode.INCREMENTAL)
            .also { importId = it }

    private fun abortOpenImport() {
        val openImportId = importId
        reset()
        if (openImportId != null) {
            try {
                client.abort(openImportId)
            } catch (e: Exception) {
                log.error("Directus '$name': Could not abort import session $openImportId", e)
            }
        }
    }

    private fun reset() {
        importId = null
        fullImport = false
        upserts.clear()
        deletes.clear()
    }
}
