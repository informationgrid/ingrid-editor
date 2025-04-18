/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.tasks

import jakarta.persistence.EntityManager
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager

@Component
class FixPathsTask(
    entityManager: EntityManager,
    transactionManager: PlatformTransactionManager,
) : DbTriggeredTask(entityManager, transactionManager) {

    override val taskKey = "doFixPaths"

    override fun executeTaskOnCatalog(catalogIdentifier: String) = migratePaths(catalogIdentifier)

    private val sqlRootDocumentWrapper = """
        SELECT dw.id FROM DocumentWrapper dw WHERE dw.catalog.identifier=:catalogIdentifier AND dw.parent IS NULL
    """.trimIndent()

    private val updateWrapperPath = """
        UPDATE document_wrapper SET path=CAST(:path as int[]) WHERE id=:id
    """.trimIndent()

    fun migratePaths(catalogIdentifier: String) {
        val docWrappersRoot = entityManager.createQuery(sqlRootDocumentWrapper)
            .setParameter("catalogIdentifier", catalogIdentifier)
            .resultList

        docWrappersRoot.forEach { wrapperId ->
            addChildren(wrapperId as Int, mutableListOf())
        }
    }

    private fun addChildren(id: Int, previousUuids: MutableList<Int>) {
        previousUuids.add(id)
        val childrenIds = entityManager
            .createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is not null and dw.parent.id = $id")
            .resultList

        childrenIds.forEach { childId ->
            entityManager
                .createNativeQuery(updateWrapperPath)
                .setParameter("path", "{${previousUuids.joinToString()}}")
                .setParameter("id", childId)
                .executeUpdate()

            addChildren(childId as Int, previousUuids.toMutableList())
        }
    }
}
