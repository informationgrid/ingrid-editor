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

    fun init(
        applicationDocs: String,
        announcementDocs: String = "null",
        reportsRecommendationDocs: String = "null",
        furtherDocs: String = "null",
        considerationDocs: String = "null",
        approvalDocs: String = "null",
        decisionDocs: String = "null",
        negativeDocs: String = "null"
    ) {
        clearAllMocks()
        every { catalogRepo.findAllByType("uvp") } returns listOf(Catalog().apply {
            identifier = "test-cat"
        })
        val input = jacksonObjectMapper().readValue(
            """{"applicationDocs": $applicationDocs, "announcementDocs": $announcementDocs, "reportsRecommendationDocs": $reportsRecommendationDocs, 
                "furtherDocs": $furtherDocs, "considerationDocs": $considerationDocs, "approvalDocs": $approvalDocs, "decisionDocs": $decisionDocs }""".trimMargin(),
            JsonNode::class.java
        )
        val inputNegative = jacksonObjectMapper().readValue(
            """{"uvpNegativeDecisionDocs": $negativeDocs}""".trimMargin(), JsonNode::class.java
        )

        every {
            entityManager.createNativeQuery(sqlStepsWithDrafts).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("step", JsonNodeBinaryType.INSTANCE).resultList
        } returns listOf(arrayOf("123", "test-cat", input))
        every {
            entityManager.createNativeQuery(sqlNegativeDecisionDocsWithDraft).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("negativeDocs", JsonNodeBinaryType.INSTANCE).resultList
        } returns listOf(arrayOf("123", "test-cat", inputNegative))
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
        every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(fakeFile(fileSystemStorage, "abc"))
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.delete(any(), any())
        }
    }

    test("not referenced document should be deleted") {
        init("[]", negativeDocs = """[{"downloadURL": { "asLink": false, "uri": "negative"}}]""")
        every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(
            fakeFile(fileSystemStorage, "abc"),
            fakeFile(fileSystemStorage, "negative")
        )
        task.start()

        verify(exactly = 1) {
            fileSystemStorage.delete("test-cat", any())
        }
    }

    test("referenced document in all tables should not be deleted") {
        init(
            """[{"downloadURL": { "asLink": false, "uri": "a"}}]""",
            """[{"downloadURL": { "asLink": false, "uri": "b"}}]""",
            """[{"downloadURL": { "asLink": false, "uri": "c"}}]""",
            """[{"downloadURL": { "asLink": false, "uri": "d"}}]""",
            """[{"downloadURL": { "asLink": false, "uri": "e"}}]""",
            """[{"downloadURL": { "asLink": false, "uri": "f"}}]""",
            """[{"downloadURL": { "asLink": false, "uri": "g"}}]""",
            """[{"downloadURL": { "asLink": false, "uri": "h"}}]""",
        )
        var fileName = 'a'
        val files = (1..8).map { fakeFile(fileSystemStorage, (fileName++).toString()) }
        
        every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns files
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.delete("test-cat", any())
        }
    }
})

private fun fakeFile(fileSystemStorage: FileSystemStorage, file: String) =
    FileSystemItem(fileSystemStorage, "test-cat", "", "", "123", file, "", 0, null, false, Scope.PUBLISHED)
