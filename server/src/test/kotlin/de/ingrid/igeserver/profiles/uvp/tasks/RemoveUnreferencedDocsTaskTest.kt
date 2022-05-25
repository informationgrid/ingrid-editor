package de.ingrid.igeserver.profiles.uvp.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import de.ingrid.mdek.upload.storage.impl.Scope
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import org.hibernate.query.NativeQuery
import javax.persistence.EntityManager

class RemoveUnreferencedDocsTaskTest : FunSpec({

    val fileSystemStorage = mockk<FileSystemStorage>(relaxed = true)
    val entityManager = mockk<EntityManager>()
    val catalogRepo = mockk<CatalogRepository>()
    val task = RemoveUnreferencedDocsTask(fileSystemStorage, entityManager, catalogRepo)

    fun init(docs: String) {
        clearAllMocks()
        every { catalogRepo.findAllByType("uvp") } returns listOf(Catalog().apply { 
            identifier = "test-cat"
        })
        val input = jacksonObjectMapper().readValue("""{"applicationDocs": ${docs}}""", JsonNode::class.java)

        every {
            entityManager.createNativeQuery(sqlSteps).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("step", JsonNodeBinaryType.INSTANCE).resultList
        } returns listOf(arrayOf("123", "test-cat", input))
        every {
            entityManager.createNativeQuery(sqlNegativeDecisionDocs).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("negativeDocs", JsonNodeBinaryType.INSTANCE).resultList
        } returns emptyList()
    }

    test("no uvp catalog") {
        every { catalogRepo.findAllByType("uvp") } returns emptyList()
        task.start()

        verify(exactly = 0) {
            entityManager.createNativeQuery(any())
        }
    }

    test("no documents") {
        init("[]")
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.delete(any(), any())
        }
    }

    test("referenced document should not be deleted") {
        init("""[{"downloadURL": { "asLink": false, "uri": "abc"}}]""")
        every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(FileSystemItem(fileSystemStorage, "test-cat", "", "", "", "abc", "", 0, null, false, Scope.PUBLISHED))
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.delete(any(), any())
        }
    }

    test("not referenced document should be deleted") {
        init("[]")
        every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(FileSystemItem(fileSystemStorage, "test-cat", "", "", "", "abc", "", 0, null, false, Scope.PUBLISHED))
        task.start()

        verify(exactly = 1) {
            fileSystemStorage.delete("test-cat", any())
        }
    }
})
