package de.ingrid.igeserver.catalogTransfer

import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import jakarta.persistence.EntityManager
import jakarta.persistence.Tuple
import jakarta.persistence.TupleElement
import kotlin.collections.get

const val CREATED_CATALOG_ID = 1337

fun mockTuple(data: MutableMap<String?, Any?>): Tuple {
    val tuple = mockk<Tuple>()
    every { tuple.elements } returns data.keys.map { mockk<TupleElement<Any>>().apply { every { alias } returns it } }
    every { tuple.get(any<String>()) } answers { data[it.invocation.args[0]] }
    return tuple
}

fun mockTuples(data: List<MutableMap<String?, Any?>>): List<Tuple> = data.map { mockTuple(it) }

fun mockEntityManagerTupleResults(entityManager: EntityManager) {
    val sqlSlot = slot<String>()

    // resultList
    every { entityManager.createNativeQuery(capture(sqlSlot), eq(Tuple::class.java)).resultList } answers {
        val sql = sqlSlot.captured

        when {
            sql.contains("SELECT * FROM catalog") -> mockTuples(listOf(catalogInfo))

            sql.contains("FROM behaviour") -> mockTuples(behaviours)
            sql.contains("FROM codelist") -> mockTuples(codelists)
            sql.contains("FROM query") -> mockTuples(queries)
            sql.contains("FROM document_wrapper") -> mockTuples(documentWrapper)
            sql.contains("FROM document") -> mockTuples(document)
            sql.contains("FROM user_info") -> mockTuples(userInfo)
            sql.contains("FROM permission_group") -> mockTuples(permissionGroup)
            sql.contains("FROM user_group") -> mockTuples(userGroup)
            sql.contains("FROM version_info") -> mockTuples(versionInfo)

            sql.contains("INSERT INTO user_info") -> mockTuples(insertedUser)
            sql.contains("INSERT INTO catalog") -> mockTuples(createdCatalogAnswer)
            sql.contains("INSERT INTO document_wrapper") -> emptyList<Tuple>()
            sql.contains("INSERT INTO permission_group") -> emptyList<Tuple>()
            else -> throw IllegalArgumentException("Unknown query: $sql")
        }
    }

    // singleResult
    every { entityManager.createNativeQuery(capture(sqlSlot)).singleResult } answers {
        val sql = sqlSlot.captured
        println("singleResult for: $sql")
        // Assume that this is the catalog id query
        when {
            sql.contains("SELECT id FROM catalog") -> 1
            sql.contains("INSERT INTO catalog") -> CREATED_CATALOG_ID
            else -> throw IllegalArgumentException("Unknown query: $sql")
        }
    }
}
