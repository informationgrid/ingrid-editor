package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import io.kotest.core.spec.style.FunSpec
import io.mockk.*
import org.hibernate.query.NativeQuery
import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import javax.persistence.EntityManager

class PublishedUploadsTest : FunSpec({
    val tomorrow = LocalDateTime.now().plusDays(1).format(DateTimeFormatter.ISO_DATE_TIME)
    val yesterday = LocalDateTime.now().minusDays(1).format(DateTimeFormatter.ISO_DATE_TIME)

    val fileSystemStorage = mockk<FileSystemStorage>(relaxed = true)
    val entityManager = mockk<EntityManager>()
    val task = UploadCleanupTask(fileSystemStorage, entityManager)

    fun init(docs: String) {
        clearAllMocks()
        val input = jacksonObjectMapper().readValue("""{"applicationDocs": ${docs}}""", JsonNode::class.java)

//        every { fileSystemStorage.docsDir } returns ""
        every {
            entityManager.createNativeQuery(task.sqlSteps).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("step", JsonNodeBinaryType.INSTANCE).resultList
        } returns listOf(arrayOf("123", "test-cat", input))
        every {
            entityManager.createNativeQuery(task.sqlNegativeDecisionDocs).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("negativeDocs", JsonNodeBinaryType.INSTANCE).resultList
        } returns emptyList()
    }

    test("empty list") {
        init("[]")
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
//        PublishedUploads("test-cat", "123", emptyList()).getDocsByLatestExpiryDate().isEmpty()
    }

    test("one item with expire = null") {
        init("""[{"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}]""")
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("one item not yet expired") {
        init("""[{"expiryDate": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}]""")
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("one item expired") {
        init("""[{"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""")
        task.cleanup()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "abc")
        }
    }

    test("two different items with expire = null") {
        init(
            """[
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two different items with expire = null AND not yet expired") {
        init(
            """[
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$tomorrow", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two different items with expire = null AND expired") {
        init(
            """[
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "def")
        }
    }

    test("two different items with not yet expire AND expired") {
        init(
            """[
            {"expiryDate": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "def")
        }
    }

    test("two different items with expired AND expired") {
        init(
            """[
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "abc")
            fileSystemStorage.archive("test-cat", "123", "def")
        }
    }

    test("two same items with expire = null") {
        init(
            """[
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with expire = null AND not yet expired") {
        init(
            """[
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with expire = null AND expired") {
        init(
            """[
            {"expiryDate": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with not yet expire AND expired") {
        init(
            """[
            {"expiryDate": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with expired AND expired") {
        init(
            """[
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"expiryDate": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.cleanup()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "abc")
        }
    }
})
