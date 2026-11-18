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
package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.profiles.uvp.UvpReferenceHandler
import de.ingrid.igeserver.profiles.uvp.tasks.UploadExpiredTask
import de.ingrid.igeserver.profiles.uvp.tasks.sqlNegativeDecisionDocsPublished
import de.ingrid.igeserver.profiles.uvp.tasks.sqlStepsPublished
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.persistence.EntityManager
import org.hibernate.query.NativeQuery
import tools.jackson.databind.JsonNode
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.ZonedDateTime
import java.time.format.DateTimeFormatter

@Suppress("SqlSourceToSinkFlow")
class UploadExpiredTaskTest :
    FunSpec({
        val tomorrow = ZonedDateTime.now().plusDays(1).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME)
        val yesterday = ZonedDateTime.now().minusDays(1).format(DateTimeFormatter.ISO_OFFSET_DATE_TIME).toString()

        val fileSystemStorage = mockk<FileSystemStorage>(relaxed = true)
        val entityManager = mockk<EntityManager>()
        val task = UploadExpiredTask(fileSystemStorage, entityManager, UvpReferenceHandler(entityManager))

        fun init(
            docs: String,
            tableField: String = "applicationDocs",
            negativeDocs: String? = null,
        ) {
            clearAllMocks()
            val stepType = when (tableField) {
                "scopingDateDocs", "scopingGeneralDocs" -> "scopeOfInvestigation"

                "announcementDocs", "applicationDocs", "reportsRecommendationDocs", "furtherDocs" ->
                    "publicDisclosure"

                "considerationDocs" -> "publicHearing"

                "approvalDocs", "decisionDocs" -> "decisionOfAdmission"

                else -> error("Unknown UVP processing-step table: $tableField")
            }
            val input = jacksonObjectMapper().readValue(
                """{"type":"$stepType","$tableField": $docs}""",
                JsonNode::class.java,
            )
            val negativeInput = negativeDocs?.let {
                jacksonObjectMapper().readValue("""{"uvpNegativeDecisionDocs": $it}""", JsonNode::class.java)
            }

//        every { fileSystemStorage.docsDir } returns ""
            every {
                entityManager.createNativeQuery(
                    match { it.startsWith(sqlStepsPublished) },
                ).unwrap(NativeQuery::class.java)
                    .addScalar("uuid")
                    .addScalar("catalogId")
                    .addScalar("step")
                    .addScalar("title")
                    .addScalar("type").resultList
            } returns listOf(arrayOf("123", "test-cat", input, "title", "type"))
            every {
                entityManager.createNativeQuery(
                    match { it.startsWith(sqlNegativeDecisionDocsPublished) },
                ).unwrap(NativeQuery::class.java)
                    .addScalar("uuid")
                    .addScalar("catalogId")
                    .addScalar("negativeDocs")
                    .addScalar("title")
                    .addScalar("type").resultList
            } returns negativeInput?.let { listOf(arrayOf("123", "test-cat", it, "title", "type")) }.orEmpty()
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

        test("expired scoping uploads without asLink are archived") {
            init(
                """[{"validUntil": "$yesterday", "downloadURL": { "uri": "scoping/date.pdf"}}]""",
                tableField = "scopingDateDocs",
            )

            task.start()

            verify(exactly = 1) {
                fileSystemStorage.archive("test-cat", "123", "scoping/date.pdf")
            }
        }

        test("expired scoping general uploads without asLink are archived") {
            init(
                """[{"validUntil": "$yesterday", "downloadURL": { "uri": "scoping/general.pdf"}}]""",
                tableField = "scopingGeneralDocs",
            )

            task.start()

            verify(exactly = 1) {
                fileSystemStorage.archive("test-cat", "123", "scoping/general.pdf")
            }
        }

        test("archived scoping uploads are restored when their validity is extended") {
            init(
                """[{"validUntil": "$tomorrow", "downloadURL": { "uri": "scoping/date.pdf"}}]""",
                tableField = "scopingDateDocs",
            )
            every { fileSystemStorage.isArchived("test-cat", "123", "scoping/date.pdf") } returns true

            task.start()

            verify(exactly = 1) {
                fileSystemStorage.restore("test-cat", "123", "scoping/date.pdf")
            }
        }

        test("external links are not selected for upload expiry") {
            init(
                """[
                    {"validUntil": "$yesterday", "downloadURL": { "asLink": true, "uri": "https://example.test/link"}},
                    {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "upload.pdf"}}
                ]""",
            )

            task.start()

            verify(exactly = 1) {
                fileSystemStorage.archive("test-cat", "123", "upload.pdf")
            }
            verify(exactly = 0) {
                fileSystemStorage.archive("test-cat", "123", "https://example.test/link")
            }
        }

        test("external link checks select only explicit external links") {
            init(
                """[
                    {"downloadURL": { "asLink": true, "uri": "https://example.test/link"}},
                    {"downloadURL": { "uri": "upload.pdf"}}
                ]""",
            )

            val links = UvpReferenceHandler(entityManager).getURLsFromCatalog("test-cat", emptyList(), "uvp")

            links.single().docs.map { it.uri } shouldBe listOf("https://example.test/link")
        }

        test("negative decision references merge with processing-step references") {
            // Same-UUID query results are synthetic and intentionally exercise defensive merge behavior.
            init(
                """[{"validUntil": "$yesterday", "downloadURL": { "uri": "step.pdf"}}]""",
                negativeDocs = """[{"validUntil": "$yesterday", "downloadURL": { "uri": "negative.pdf"}}]""",
            )

            task.start()

            verify(exactly = 1) {
                fileSystemStorage.archive("test-cat", "123", "step.pdf")
                fileSystemStorage.archive("test-cat", "123", "negative.pdf")
            }
        }

        test("two different items with expire = null") {
            init(
                """[
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}, 
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "def"}}]
                """.trimMargin(),
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
            {"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "def"}}]
                """.trimMargin(),
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
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]
                """.trimMargin(),
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
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]
                """.trimMargin(),
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
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "def"}}]
                """.trimMargin(),
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
            {"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}]
                """.trimMargin(),
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
            {"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}]
                """.trimMargin(),
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
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]
                """.trimMargin(),
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
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]
                """.trimMargin(),
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
            {"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]
                """.trimMargin(),
            )
            task.start()

            verify(exactly = 1) {
                fileSystemStorage.archive("test-cat", "123", "abc")
            }
        }

        test("archive file is not restored when still expired") {
            init(
                """[{"validUntil": "$yesterday", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin(),
            )
            every { fileSystemStorage.isArchived("test-cat", "123", "abc") } returns true

            task.start()

            verify(exactly = 0) {
                fileSystemStorage.restore(any(), any(), any())
            }
        }

        test("archive file is restored when not yet expired") {
            init(
                """[{"validUntil": "$tomorrow", "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin(),
            )
            every { fileSystemStorage.isArchived("test-cat", "123", "abc") } returns true

            task.start()

            verify(exactly = 1) {
                fileSystemStorage.restore("test-cat", "123", "abc")
            }
        }

        test("archive file is restored when expired = null") {
            init(
                """[{"validUntil": null, "downloadURL": { "asLink": false, "uri": "abc"}}]""".trimMargin(),
            )
            every { fileSystemStorage.isArchived("test-cat", "123", "abc") } returns true

            task.start()

            verify(exactly = 1) {
                fileSystemStorage.restore("test-cat", "123", "abc")
            }
        }
    })
