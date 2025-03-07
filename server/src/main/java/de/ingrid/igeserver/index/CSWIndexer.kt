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
import CSWClient
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.ElasticDocument
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import java.time.Instant
import java.util.*

class CSWIndexer(override val name: String, private val client: CSWClient) : IIndexManager {
    private val log = logger()

    private var transactionId : String = "transaction:" + generateTimeBasedTransactionId()
    private lateinit var catalogId : String

    override fun onFinishIndexAll() {
        client.cleanupOrphans(catalogId, transactionId)
    }

    override fun setCatalogId(catalogId: String) {
        this.catalogId = "catalog:" + catalogId
    }

    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String?): String? = runBlocking {
        client.getName()
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean = runBlocking {
        true
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
    }

    override fun checkAndCreateInformationIndex() {
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument) {
        client.insertOrUpdate(doc, catalogId, transactionId)
    }

    override fun updateIPlugInformation(id: String, info: String) {

    }

    override fun flush() {
    }

    override fun deleteIndex(index: String) {

    }

    override fun getIndices(filter: String): List<String> {
        return emptyList()
    }

    override fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean) {
        client.delete(id)
    }

    override fun indexExists(indexName: String): Boolean = runBlocking { true }

    override fun getCategories(): List<DocumentCategory> {
        return listOf(DocumentCategory.DATA)
    }

    fun generateTimeBasedTransactionId(): String {
        val timestamp = Instant.now().toEpochMilli().toString(36) // Base 36 for shorter timestamp
        val randomUUID = UUID.randomUUID().toString().replace("-", "").substring(0,10) // shorter UUID

        return "${timestamp}-${randomUUID}"
    }
}
