package de.ingrid.igeserver.tasks

import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.vladmihalcea.hibernate.type.json.JsonNodeBinaryType
import de.ingrid.igeserver.profiles.uvp.UvpReferenceHandler
import de.ingrid.igeserver.profiles.uvp.tasks.UploadExpiredTask
import de.ingrid.igeserver.profiles.uvp.tasks.sqlNegativeDecisionDocsPublished
import de.ingrid.igeserver.profiles.uvp.tasks.sqlStepsPublished
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import io.kotest.core.spec.style.FunSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.persistence.EntityManager
import org.hibernate.query.NativeQuery
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

class UploadExpiredTaskTest : FunSpec({
    val tomorrow = ZonedDateTime.now().plusDays(1).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
    val yesterday = ZonedDateTime.now().minusDays(1).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME).toString()

    val fileSystemStorage = mockk<FileSystemStorage>(relaxed = true)
    val entityManager = mockk<EntityManager>()
    val task = UploadExpiredTask(fileSystemStorage, entityManager, UvpReferenceHandler(entityManager))

    fun init(docs: String) {
        clearAllMocks()
        val input = jacksonObjectMapper().readValue("""{"applicationDocs": ${docs}}""", JsonNode::class.java)

//        every { fileSystemStorage.docsDir } returns ""
        every {
            entityManager.createNativeQuery(sqlStepsPublished).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("step", JsonNodeBinaryType.INSTANCE)
                .addScalar("title")
                .addScalar("type").resultList
        } returns listOf(arrayOf("123", "test-cat", input, "title", "type"))
        every {
            entityManager.createNativeQuery(sqlNegativeDecisionDocsPublished).unwrap(NativeQuery::class.java)
                .addScalar("uuid")
                .addScalar("catalogId")
                .addScalar("negativeDocs", JsonNodeBinaryType.INSTANCE)
                .addScalar("title")
                .addScalar("type").resultList
        } returns emptyList()
    }

    test("empty list") {
        init("[]")
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("one item with expire = null") {
        init("""[{"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}]""")
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("one item not yet expired") {
        init("""[{"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}]""")
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("one item expired") {
        init("""[{"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""")
        task.start()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "abc")
        }
    }

    test("two different items with expire = null") {
        init(
            """[
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two different items with expire = null AND not yet expired") {
        init(
            """[
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two different items with expire = null AND expired") {
        init(
            """[
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "def")
        }
    }

    test("two different items with not yet expire AND expired") {
        init(
            """[
            {"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "def")
        }
    }

    test("two different items with expired AND expired") {
        init(
            """[
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "abc")
            fileSystemStorage.archive("test-cat", "123", "def")
        }
    }

    test("two same items with expire = null") {
        init(
            """[
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with expire = null AND not yet expired") {
        init(
            """[
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with expire = null AND expired") {
        init(
            """[
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with not yet expire AND expired") {
        init(
            """[
            {"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 0) {
            fileSystemStorage.archive(any(), any(), any())
        }
    }

    test("two same items with expired AND expired") {
        init(
            """[
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        task.start()

        verify(exactly = 1) {
            fileSystemStorage.archive("test-cat", "123", "abc")
        }
    }

    test("archive file is not restored when still expired") {
        init(
            """[{"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        every { fileSystemStorage.isArchived("test-cat", "123", "abc") } returns true

        task.start()

        verify(exactly = 0) {
            fileSystemStorage.restore(any(), any(), any())
        }
    }

    test("archive file is restored when not yet expired") {
        init(
            """[{"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        every { fileSystemStorage.isArchived("test-cat", "123", "abc") } returns true

        task.start()

        verify(exactly = 1) {
            fileSystemStorage.restore("test-cat", "123", "abc")
        }
    }

    test("archive file is restored when expired = null") {
        init(
            """[{"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin()
        )
        every { fileSystemStorage.isArchived("test-cat", "123", "abc") } returns true

        task.start()

        verify(exactly = 1) {
            fileSystemStorage.restore("test-cat", "123", "abc")
        }
    }
})
