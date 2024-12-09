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

    every { entityManager.createNativeQuery(capture(sqlSlot), eq(Tuple::class.java)).resultList } answers {
        val sql = sqlSlot.captured

        if (sql.contains("SELECT * FROM catalog")) {
            mockTuples(listOf(catalogInfo))
        } else if (sql.contains("FROM behaviour")) {
            mockTuples(behaviours)
        } else if (sql.contains("FROM codelist")) {
            mockTuples(codelists)
        } else if (sql.contains("FROM query")) {
            mockTuples(queries)
        } else if (sql.contains("FROM document_wrapper")) {
            mockTuples(documentWrapper)
        } else if (sql.contains("FROM document")) {
            mockTuples(document)
        } else if (sql.contains("FROM user_info")) {
            mockTuples(userInfo)
        } else if (sql.contains("FROM permission_group")) {
            mockTuples(permissionGroup)
        } else if (sql.contains("FROM user_group")) {
            mockTuples(userGroup)
        } else if (sql.contains("FROM version_info")) {
            mockTuples(versionInfo)
        } else if (sql.contains("INSERT INTO user_info")) {
            mockTuples(insertedUser)
        } else {
            println("WARN Unknown query: $sql")
            emptyList()
//            throw IllegalArgumentException("Unknown query: $sql")
        }
    }

    every { entityManager.createNativeQuery(capture(sqlSlot)).singleResult } answers {
        val sql = sqlSlot.captured
        println("singleResult for: $sql")
        // Assume that this is the catalog id query
        if (sql.contains("SELECT id FROM catalog")) {
            1
        } else if (sql.contains("INSERT INTO catalog")) {
            CREATED_CATALOG_ID
        } else {
            throw IllegalArgumentException("Unknown query: $sql")
        }
    }
}
