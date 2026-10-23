/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.migrations

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import jakarta.persistence.EntityManager

const val DEFAULT_MIGRATION_BATCH_SIZE = 100

/**
 * Iterates over all documents matching [condition] in batches, using keyset pagination on `doc.id`.
 * See [forEachDocumentBatch] for the memory handling.
 *
 * @param condition optional JPQL condition, referencing the document with the alias `doc`
 * @param joins optional JPQL joins, e.g. `JOIN doc.catalog cat`
 * @param parameters named parameters used in [condition] or [joins]
 */
fun EntityManager.forEachDocumentInBatches(
    condition: String? = null,
    joins: String = "",
    parameters: Map<String, Any> = emptyMap(),
    batchSize: Int = DEFAULT_MIGRATION_BATCH_SIZE,
    action: (Document) -> Unit,
) {
    val additionalCondition = if (condition == null) "" else "AND ($condition)"
    val jpql = "SELECT doc FROM Document doc $joins WHERE doc.id > :lastId $additionalCondition ORDER BY doc.id"

    forEachDocumentBatch(
        batchSize,
        { lastId ->
            createQuery(jpql, Document::class.java)
                .setParameter("lastId", lastId)
                .apply { parameters.forEach { (name, value) -> setParameter(name, value) } }
                .setMaxResults(batchSize)
                .resultList
        },
        action,
    )
}

/**
 * Processes documents batch by batch. [fetchBatch] must return at most [batchSize] documents with an
 * id greater than the given one, ordered by id (keyset pagination).
 *
 * After each batch all changes are flushed and the persistence context is cleared. Otherwise, all loaded
 * documents (and the snapshots of their JSON data for dirty checking) would stay in memory until the end
 * of the transaction. Documents from previous batches are detached, so do not keep references to them.
 *
 * Must be called within a transaction.
 */
fun EntityManager.forEachDocumentBatch(
    batchSize: Int,
    fetchBatch: (lastId: Int) -> List<Document>,
    action: (Document) -> Unit,
) {
    var lastId = 0
    do {
        val documents = fetchBatch(lastId)
        documents.forEach(action)
        documents.lastOrNull()?.let { lastId = it.id!! }
        flush()
        clear()
    } while (documents.size == batchSize)
}
