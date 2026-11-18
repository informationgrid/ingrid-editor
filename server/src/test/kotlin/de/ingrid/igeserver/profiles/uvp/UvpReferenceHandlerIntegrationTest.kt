/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * Licence;
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
package de.ingrid.igeserver.profiles.uvp

import IntegrationTest
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.uvp.tasks.RemoveUnreferencedDocsTask
import de.ingrid.igeserver.services.DocumentState
import de.ingrid.igeserver.utils.ReferenceHandler
import io.kotest.matchers.shouldBe
import io.mockk.every
import io.mockk.mockk
import jakarta.persistence.EntityManager
import jakarta.transaction.Transactional
import org.apache.logging.log4j.Level
import org.apache.logging.log4j.LogManager
import org.apache.logging.log4j.core.Appender
import org.apache.logging.log4j.core.LogEvent
import org.apache.logging.log4j.core.Logger
import org.springframework.beans.factory.annotation.Autowired
import tools.jackson.databind.node.ObjectNode
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.time.OffsetDateTime
import java.util.UUID

@Transactional
class UvpReferenceHandlerIntegrationTest : IntegrationTest() {

    @Autowired
    private lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var removeUnreferencedDocsTask: RemoveUnreferencedDocsTask

    private val objectMapper = jacksonObjectMapper()

    @Test
    fun `reference queries combine id and catalog filters and preserve document states`() {
        val catalogA = persistCatalog("uvp_reference_a")
        val catalogB = persistCatalog("uvp_reference_b")
        val publishedA = persistDocument(
            catalogA,
            DocumentState.PUBLISHED,
            """{"processingSteps":[{"type":"scopeOfInvestigation","scopingDateDocs":[{"downloadURL":{"uri":"scoping-a.pdf"}}]}]}""",
        )
        val secondPublishedA = persistDocument(
            catalogA,
            DocumentState.PUBLISHED,
            """{"processingSteps":[{"type":"publicDisclosure","applicationDocs":[{"downloadURL":{"uri":"application-a.pdf"}}]}]}""",
        )
        val draftA = persistDocument(catalogA, DocumentState.DRAFT, """{"processingSteps":[{"type":"publicDisclosure"}]}""")
        val pendingA = persistDocument(catalogA, DocumentState.PENDING, """{"processingSteps":[{"type":"publicDisclosure"}]}""")
        val draftAndPublishedA = persistDocument(
            catalogA,
            DocumentState.DRAFT_AND_PUBLISHED,
            """{"processingSteps":[{"type":"publicDisclosure"}]}""",
        )
        persistDocument(
            catalogA,
            DocumentState.ARCHIVED,
            """{"processingSteps":[{"type":"publicDisclosure","applicationDocs":[{"downloadURL":{"uri":"archived.pdf"}}]}]}""",
        )
        val negativeDocumentB = persistDocument(
            catalogB,
            DocumentState.PUBLISHED,
            """
            {
                "processingSteps": [],
                "uvpNegativeDecisionDocs": [{"downloadURL":{"uri":"negative-b.pdf"}}]
            }
            """.trimIndent(),
            docType = "UvpNegativePreliminaryAssessmentDoc",
        )
        entityManager.flush()

        removeUnreferencedDocsTask.queryDocs()
            .single { it[0].toString() == publishedA.uuid }[3].toString() shouldBe publishedA.title

        val handler = UvpReferenceHandler(entityManager)
        val byDocumentAndCatalog = handler.getPublishedDocumentsByCatalog(publishedA.id, catalogA.identifier)
        val byCatalog = handler.getPublishedDocumentsByCatalog(catalogId = catalogA.identifier)
        val nonArchived = handler.getDraftAndPendingDocumentsByCatalog(catalogId = catalogA.identifier)

        byDocumentAndCatalog.map { it.docUuid } shouldBe listOf(publishedA.uuid)
        byDocumentAndCatalog.single().docs.map { it.uri } shouldBe listOf("scoping-a.pdf")
        byCatalog.map { it.docUuid }.toSet() shouldBe setOf(publishedA.uuid, secondPublishedA.uuid)
        nonArchived.map { it.docUuid }.toSet() shouldBe setOf(
            publishedA.uuid,
            secondPublishedA.uuid,
            draftA.uuid,
            pendingA.uuid,
            draftAndPublishedA.uuid,
        )
        byCatalog.none { it.docUuid == negativeDocumentB.uuid } shouldBe true
        nonArchived.none { it.docUuid == negativeDocumentB.uuid } shouldBe true
    }

    @Test
    fun `reference extraction diagnostics are logged for processing and negative-decision tables`() {
        val catalog = persistCatalog("uvp_reference_diagnostics")
        val document = persistDocument(
            catalog,
            DocumentState.PUBLISHED,
            """
            {
                "processingSteps": [{
                    "type": "publicDisclosure",
                    "applicationDocs": [{"downloadURL":{"uri":"upload.pdf"},"validUntil":""}]
                }],
                "uvpNegativeDecisionDocs": [{"downloadURL":null}]
            }
            """.trimIndent(),
        )
        val handler = UvpReferenceHandler(entityManager)
        val logger = LogManager.getLogger(ReferenceHandler::class.java) as Logger
        val appender = mockk<Appender>(relaxed = true)
        val events = mutableListOf<LogEvent>()
        every { appender.name } returns "uvpReferenceHandlerIntegrationTest"
        every { appender.isStarted } returns true
        every { appender.append(capture(events)) } answers { }
        logger.addAppender(appender)

        try {
            val references = handler.getPublishedDocumentsByCatalog(catalogId = catalog.identifier)
            val messages = events.map { it.message.formattedMessage }

            references.single { it.docUuid == document.uuid }.docs.map { it.uri } shouldBe listOf("upload.pdf")
            events.size shouldBe 2
            events.all { it.level == Level.WARN } shouldBe true
            messages.any {
                it.contains(document.uuid) && it.contains(document.title.orEmpty()) && it.contains("applicationDocs")
            } shouldBe true
            messages.any {
                it.contains(document.uuid) && it.contains(document.title.orEmpty()) &&
                    it.contains("uvpNegativeDecisionDocs")
            } shouldBe true
        } finally {
            logger.removeAppender(appender)
        }
    }

    private fun persistCatalog(identifier: String): Catalog = Catalog().apply {
        this.identifier = identifier
        name = identifier
        type = "uvp"
        entityManager.persist(this)
    }

    private fun persistDocument(
        catalog: Catalog,
        state: DocumentState,
        json: String,
        docType: String = "UvpApprovalProcedureDoc",
    ): Document {
        val uuid = UUID.randomUUID().toString()
        val now = OffsetDateTime.now()
        val document = Document().apply {
            this.uuid = uuid
            this.type = docType
            title = uuid
            data = objectMapper.readTree(json) as ObjectNode
            this.catalog = catalog
            this.state = state
            created = now
            modified = now
            contentmodified = now
        }
        entityManager.persist(document)

        val wrapper = DocumentWrapper().apply {
            this.uuid = uuid
            this.type = docType
            category = "data"
            this.catalog = catalog
        }
        entityManager.persist(wrapper)
        return document
    }
}
