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
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.jillesvangurp.ktsearch.BulkSession
import com.jillesvangurp.ktsearch.RestException
import com.jillesvangurp.ktsearch.SearchClient
import com.jillesvangurp.ktsearch.createIndex
import com.jillesvangurp.ktsearch.deleteIndex
import com.jillesvangurp.ktsearch.exists
import com.jillesvangurp.ktsearch.getAliases
import com.jillesvangurp.ktsearch.indexDocument
import com.jillesvangurp.ktsearch.search
import com.jillesvangurp.ktsearch.updateAliases
import com.jillesvangurp.searchdsls.querydsl.sort
import com.jillesvangurp.searchdsls.querydsl.term
import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.services.CSWTService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.ElasticDocument
import kotlinx.coroutines.runBlocking
import org.apache.logging.log4j.kotlin.logger
import java.io.IOException

private const val META_INDEX = "ingrid_meta"

/**
 * Utility class to manage elasticsearch indices and documents.
 * @author Andre
 */
class CSWTIndexer(override val name: String, private val client: CSWTService.CSWTClient) : IIndexManager {
    private val log = logger()

    override fun getIndexNameFromAliasName(indexAlias: String, partialName: String?): String? = runBlocking {
        client.name
    }

    override fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean = runBlocking {
        true
    }

    override fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String) {
    }

    override fun checkAndCreateInformationIndex() {
    }

    override fun update(indexinfo: IndexInfo, doc: ElasticDocument) {
        client.insertOrUpdate(doc)
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
    }

    override fun indexExists(indexName: String): Boolean = runBlocking { true }

    override fun getCategories(): List<DocumentCategory> {
        return listOf(DocumentCategory.DATA)
    }
}
