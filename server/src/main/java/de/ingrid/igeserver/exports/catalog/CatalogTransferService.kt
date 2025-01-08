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
package de.ingrid.igeserver.exports.catalog

import de.ingrid.igeserver.model.User
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import jakarta.persistence.EntityManager
import jakarta.persistence.Query
import jakarta.persistence.Tuple
import org.apache.logging.log4j.kotlin.logger
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class CatalogTransferService(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
) {
    private val log = logger()

    /**
     * Get all data from a table where the catalog_id is the given id
     * @param tableName the name of the table
     * @param catalogId the id of the catalog
     * @return a list where each row is a maps where the key is the column name and the value is the value
     */
    fun getSimpleQueryResultsAsMap(tableName: String, catalogId: Int): List<MutableMap<String?, Any?>> = getQueryResultsAsMap(
        """
        SELECT * FROM $tableName WHERE catalog_id = $catalogId;
        """.trimIndent(),
    )

    /**
     *  Get all data from a query as a list of maps where the key is the column name and the value is the value
     *  WARNING: Unsafe SQL
     *  @param sql the sql query.
     *  @return a list where each row is a maps where the key is the column name and the value is the value
     */
    fun getQueryResultsAsMap(sql: String): List<MutableMap<String?, Any?>> {
        val nativeQuery = entityManager.createNativeQuery(sql, Tuple::class.java)
        return getQueryResultsAsMap(nativeQuery)
    }

    fun getQueryResultsAsMap(nativeQuery: Query): List<MutableMap<String?, Any?>> {
        @Suppress("UNCHECKED_CAST")
        val result = nativeQuery.resultList as List<Tuple>
        return result.map { item ->
            item.elements.associate { element ->
                element.alias to item.get(element.alias)
            }.toMutableMap()
        }
    }

    fun importToTable(tableName: String, data: List<Map<String?, Any?>>, chunkSize: Int = 1000) {
        if (data.isEmpty()) {
            log.warn("No data to import to table $tableName")
            return
        }

        try {
            // Process data in manageable chunks
            data.chunked(chunkSize).forEachIndexed { index, chunk ->
                log.debug("Processing chunk $index with ${chunk.size} entries for table $tableName ...")

                ClosableTransaction(transactionManager).use {
                    val query = entityManager.createNativeQuery(
                        """
                    INSERT INTO $tableName (${chunk.first().keys.joinToString()}) VALUES ${generatePlaceholder(chunk)};
                        """.trimIndent(),
                    )
                    populateParameters(query, chunk)
                    query.executeUpdate()
                }
            }
        } catch (e: Exception) {
            log.error("Error while importing data to table $tableName")
            throw e
        }
    }

    internal fun generatePlaceholder(data: List<Map<String?, Any?>>): String = data.joinToString { row ->
        "(${
            row.entries.joinToString {
                when (it.key) {
                    "data", "settings", "fingerprint", "permissions" -> "? ::jsonb"
                    "created", "modified", "contentmodified", "pending_date", "last_expiry_time" -> "? ::timestamp at time zone 'UTC'"
                    "tags", "path" -> "? ::text[]"
                    else -> "?"
                }
            }})"
    }

    /**
     * Set the query parameters for the given query
     * @param query the query to set the parameters for
     * @param data the data to set as parameters
     */
    fun populateParameters(query: Query, data: List<Map<String?, Any?>>) {
        var idx = 1
        data.forEach { row ->
            row.values.forEach { value ->
                query.setParameter(idx++, value)
            }
        }
    }

    fun getEditorVersion() = getQueryResultsAsMap(
        """
                SELECT value FROM version_info WHERE key = 'schema_version';
        """.trimIndent(),
    ).first()["value"] as String

    data class ExportedCatalog(
        var version: String,
        var catalog: MutableMap<String?, Any?>,
        var behaviour: List<MutableMap<String?, Any?>>,
        var codelist: List<MutableMap<String?, Any?>>,
        var userInfo: List<MutableMap<String?, Any?>>,
        var query: List<MutableMap<String?, Any?>>,
        var documentWrapper: List<MutableMap<String?, Any?>>,
        var document: List<MutableMap<String?, Any?>>,
        val permissionGroup: List<MutableMap<String?, Any?>>,
        val userGroup: List<MutableMap<String?, Any?>>,
        val users: List<User>,
    )
}
