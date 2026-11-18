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
package de.ingrid.igeserver.profiles.uvp.tasks

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.mdek.upload.storage.impl.FileSystemItem
import de.ingrid.mdek.upload.storage.impl.FileSystemStorage
import de.ingrid.mdek.upload.storage.impl.Scope
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.shouldBe
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.verify
import jakarta.persistence.EntityManager
import org.hibernate.query.NativeQuery

@Suppress("SqlSourceToSinkFlow")
class RemoveUnreferencedDocsTaskTest :
    FunSpec({

        val fileSystemStorage = mockk<FileSystemStorage>(relaxed = true)
        val entityManager = mockk<EntityManager>()
        val catalogRepo = mockk<CatalogRepository>()
        val task = RemoveUnreferencedDocsTask(fileSystemStorage, entityManager, catalogRepo)

        @Suppress("LongParameterList")
        fun init(
            applicationDocs: String,
            announcementDocs: String = "[]",
            reportsRecommendationDocs: String = "[]",
            furtherDocs: String = "[]",
            considerationDocs: String = "[]",
            approvalDocs: String = "[]",
            decisionDocs: String = "[]",
            negativeDocs: String? = null,
            scopingDateDocs: String = "[]",
            scopingGeneralDocs: String = "[]",
        ) {
            clearAllMocks()
            every { catalogRepo.findAllByType("uvp") } returns listOf(
                Catalog().apply {
                    identifier = "test-cat"
                },
            )
            val processingSteps = """
                [
                  {"type": "scopeOfInvestigation", "scopingDateDocs": $scopingDateDocs, "scopingGeneralDocs": $scopingGeneralDocs},
                  {"type": "publicDisclosure", "applicationDocs": $applicationDocs, "announcementDocs": $announcementDocs,
                   "reportsRecommendationDocs": $reportsRecommendationDocs, "furtherDocs": $furtherDocs},
                  {"type": "publicHearing", "considerationDocs": $considerationDocs},
                  {"type": "decisionOfAdmission", "approvalDocs": $approvalDocs, "decisionDocs": $decisionDocs}
                ]
            """.trimIndent()
            val document = """{"processingSteps": $processingSteps}"""
            val documents = mutableListOf(
                arrayOf<Any?>("123", "test-cat", document, "Test document"),
            )
            negativeDocs?.let { docs ->
                documents.add(
                    arrayOf<Any?>(
                        "456",
                        "test-cat",
                        """{"uvpNegativeDecisionDocs": $docs}""",
                        "Negative decision document",
                    ),
                )
            }

            every {
                entityManager.createNativeQuery(sqlUvpDocumentsWithDrafts).unwrap(NativeQuery::class.java)
                    .addScalar("uuid")
                    .addScalar("catalogId")
                    .addScalar("data")
                    .addScalar("title").resultList
            } returns documents
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
            every {
                fileSystemStorage.list("test-cat", Scope.PUBLISHED)
            } returns listOf(fakeFile(fileSystemStorage, "abc"))
            task.start()

            verify(exactly = 0) {
                fileSystemStorage.delete(any(), any())
            }
        }

        test("invalid metadata does not block cleanup and malformed asLink is retained as an upload") {
            init(
                """[{"downloadURL":{"asLink":"unknown","uri":"ambiguous.pdf"},"validUntil":""}]""",
            )
            every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(
                fakeFile(fileSystemStorage, "ambiguous.pdf"),
                fakeFile(fileSystemStorage, "orphan.pdf"),
            )

            task.start()

            verify(exactly = 0) {
                fileSystemStorage.delete("test-cat", match { it.relativePath == "123/ambiguous.pdf" })
            }
            verify(exactly = 1) {
                fileSystemStorage.delete("test-cat", match { it.relativePath == "123/orphan.pdf" })
            }
        }

        test("not referenced document should be deleted") {
            init("[]", negativeDocs = """[{"downloadURL": { "asLink": false, "uri": "negative"}}]""")
            every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(
                fakeFile(fileSystemStorage, "abc"),
                fakeFile(fileSystemStorage, "negative", "456"),
            )
            task.start()

            verify(exactly = 1) {
                fileSystemStorage.delete("test-cat", match { it.relativePath == "123/abc" })
            }
            verify(exactly = 0) {
                fileSystemStorage.delete("test-cat", match { it.relativePath == "456/negative" })
            }
        }

        test("referenced document in all tables should not be deleted") {
            init(
                applicationDocs = """[{"downloadURL": { "asLink": false, "uri": "a"}}]""",
                announcementDocs = """[{"downloadURL": { "asLink": false, "uri": "b"}}]""",
                reportsRecommendationDocs = """[{"downloadURL": { "asLink": false, "uri": "c"}}]""",
                furtherDocs = """[{"downloadURL": { "asLink": false, "uri": "d"}}]""",
                considerationDocs = """[{"downloadURL": { "asLink": false, "uri": "e"}}]""",
                approvalDocs = """[{"downloadURL": { "asLink": false, "uri": "f"}}]""",
                decisionDocs = """[{"downloadURL": { "asLink": false, "uri": "g"}}]""",
                negativeDocs = """[{"downloadURL": { "asLink": false, "uri": "h"}}]""",
                scopingDateDocs = """[{"downloadURL": { "asLink": false, "uri": "i"}}]""",
                scopingGeneralDocs = """[{"downloadURL": { "asLink": false, "uri": "j"}}]""",
            )
            val files = ('a'..'g').map { fakeFile(fileSystemStorage, it.toString()) } +
                listOf(fakeFile(fileSystemStorage, "h", "456")) +
                ('i'..'j').map { fakeFile(fileSystemStorage, it.toString()) }

            every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns files
            task.start()

            verify(exactly = 0) {
                fileSystemStorage.delete("test-cat", any())
            }
        }

        test("referenced scoping documents are kept while links and unrelated files are removed") {
            init(
                "[]",
                scopingDateDocs = """[{"downloadURL": { "uri": "scoping/date/report.pdf"}}]""",
                scopingGeneralDocs = """[
                    {"downloadURL": { "asLink": false, "uri": "scoping-general.pdf"}},
                    {"downloadURL": { "asLink": true, "uri": "linked.pdf"}}
                ]""",
            )
            every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(
                fakeFile(fileSystemStorage, "report.pdf", "123/scoping/date"),
                fakeFile(fileSystemStorage, "scoping-general.pdf"),
                fakeFile(fileSystemStorage, "linked.pdf"),
                fakeFile(fileSystemStorage, "orphan.pdf"),
            )

            task.start()

            verify(exactly = 0) {
                fileSystemStorage.delete(
                    "test-cat",
                    match { it.file == "report.pdf" || it.file == "scoping-general.pdf" },
                )
            }
            verify(exactly = 1) {
                fileSystemStorage.delete("test-cat", match { it.file == "linked.pdf" })
            }
            verify(exactly = 1) {
                fileSystemStorage.delete("test-cat", match { it.file == "orphan.pdf" })
            }
        }

        test("referenced document from extracted zip file should not be deleted") {
            init(
                """[{"downloadURL": { "asLink": false, "uri": "test-upload/test-upload/obj (10).csv"}}]""",
            )
            every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(
                fakeFile(fileSystemStorage, "obj (10).csv", "123/test-upload/test-upload"),
            )
            task.start()

            verify(exactly = 0) {
                fileSystemStorage.delete("test-cat", any())
            }
        }

        test("ambiguous references skip only their catalog cleanup") {
            init("[]")
            every { catalogRepo.findAllByType("uvp") } returns listOf(
                Catalog().apply { identifier = "test-cat" },
                Catalog().apply { identifier = "other-cat" },
            )
            every {
                entityManager.createNativeQuery(sqlUvpDocumentsWithDrafts).unwrap(NativeQuery::class.java)
                    .addScalar("uuid")
                    .addScalar("catalogId")
                    .addScalar("data")
                    .addScalar("title").resultList
            } returns listOf(
                arrayOf(
                    "123",
                    "test-cat",
                    """{"processingSteps":[{"type":"publicDisclosure","applicationDocs":[{"downloadURL":null}]}]}""",
                    "Malformed document",
                ),
                arrayOf(
                    "456",
                    "other-cat",
                    """{"processingSteps":[{"type":"publicDisclosure","applicationDocs":[]}] }""",
                    "Valid document",
                ),
            )
            every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(
                fakeFile(fileSystemStorage, "orphan.pdf"),
            )
            every { fileSystemStorage.list("other-cat", Scope.PUBLISHED) } returns listOf(
                fakeFile(fileSystemStorage, "orphan.pdf", catalog = "other-cat"),
            )

            val result = runCatching { task.start() }

            result.isSuccess shouldBe true
            verify(exactly = 0) { fileSystemStorage.delete("test-cat", any()) }
            verify(exactly = 1) { fileSystemStorage.delete("other-cat", any()) }
        }

        test("same basename in another path or document is not treated as referenced") {
            init(
                "[]",
                scopingDateDocs = """[{"downloadURL":{"uri":"scoping/date/report.pdf"}}]""",
            )
            every { fileSystemStorage.list("test-cat", Scope.PUBLISHED) } returns listOf(
                fakeFile(fileSystemStorage, "report.pdf", "123/scoping/date"),
                fakeFile(fileSystemStorage, "report.pdf", "123/other"),
                fakeFile(fileSystemStorage, "report.pdf", "456/scoping/date"),
                fakeFile(fileSystemStorage, "orphan.pdf"),
            )

            task.start()

            verify(exactly = 0) {
                fileSystemStorage.delete("test-cat", match { it.relativePath == "123/scoping/date/report.pdf" })
            }
            verify(exactly = 3) {
                fileSystemStorage.delete(
                    "test-cat",
                    match {
                        it.relativePath in setOf(
                            "123/other/report.pdf",
                            "456/scoping/date/report.pdf",
                            "123/orphan.pdf",
                        )
                    },
                )
            }
        }

        test("referenced uploads are retained across every storage scope") {
            init("""[{"downloadURL":{"uri":"document.pdf"}}]""")
            val scopes = listOf(Scope.PUBLISHED, Scope.UNPUBLISHED, Scope.ARCHIVED, Scope.ARCHIVED_UNPUBLISHED)
            scopes.forEach { scope ->
                every { fileSystemStorage.list("test-cat", scope) } returns listOf(
                    fakeFile(fileSystemStorage, "document.pdf", scope = scope),
                    fakeFile(fileSystemStorage, "orphan.pdf", scope = scope),
                )
            }

            task.start()

            verify(exactly = 0) {
                fileSystemStorage.delete("test-cat", match { it.relativePath == "123/document.pdf" })
            }
            verify(exactly = 4) {
                fileSystemStorage.delete("test-cat", match { it.relativePath == "123/orphan.pdf" })
            }
        }
    })

private fun fakeFile(
    fileSystemStorage: FileSystemStorage,
    file: String,
    path: String = "123",
    catalog: String = "test-cat",
    scope: Scope = Scope.PUBLISHED,
) = FileSystemItem(fileSystemStorage, catalog, "", "", path, file, "", 0, null, false, scope)
