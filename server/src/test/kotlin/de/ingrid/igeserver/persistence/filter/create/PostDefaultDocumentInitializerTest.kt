/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.persistence.filter.create

import de.ingrid.igeserver.api.TagRequest
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.persistence.filter.PostCreatePayload
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.DocumentService
import io.kotest.matchers.collections.shouldContainExactly
import io.kotest.matchers.shouldBe
import io.mockk.CapturingSlot
import io.mockk.every
import io.mockk.mockk
import io.mockk.slot
import io.mockk.verify
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test

class PostDefaultDocumentInitializerTest {

    private lateinit var behaviourService: BehaviourService
    private lateinit var documentService: DocumentService
    private lateinit var initializer: PostDefaultDocumentInitializer

    private val catalogId = "test-catalog"
    private val context = DefaultContext(catalogId, "test", null, null)
    private lateinit var payload: PostCreatePayload

    @BeforeEach
    fun setUp() {
        behaviourService = mockk()
        documentService = mockk(relaxed = true)
        initializer = PostDefaultDocumentInitializer(behaviourService, documentService)

        val doc = Document()
        val wrapper = DocumentWrapper()
        wrapper.id = 42
        payload = PostCreatePayload(mockk<EntityType>(), catalogId, doc, wrapper)
    }

    @Test
    fun `does not update tags when defaultPublicationType is null`() {
        every { behaviourService.get(catalogId, "plugin.tags") } returns null

        initializer.invoke(payload, context)

        verify(exactly = 0) { documentService.updateTags(any(), any(), any()) }
    }

    @Test
    fun `does not update tags when defaultPublicationType is internet (lowercase)`() {
        every { behaviourService.get(catalogId, "plugin.tags") } returns behaviourWithValue("internet")

        initializer.invoke(payload, context)

        verify(exactly = 0) { documentService.updateTags(any(), any(), any()) }
    }

    @Test
    fun `does not update tags when defaultPublicationType is internet (mixed case)`() {
        every { behaviourService.get(catalogId, "plugin.tags") } returns behaviourWithValue("InTeRnEt")

        initializer.invoke(payload, context)

        verify(exactly = 0) { documentService.updateTags(any(), any(), any()) }
    }

    @Test
    fun `updates tags when defaultPublicationType is intranet`() {
        val value = "intranet"
        every { behaviourService.get(catalogId, "plugin.tags") } returns behaviourWithValue(value)
        val captured: CapturingSlot<TagRequest> = slot()

        initializer.invoke(payload, context)

        verify(exactly = 1) {
            documentService.updateTags(catalogId, 42, capture(captured))
        }
        captured.captured.remove shouldBe emptyList()
        captured.captured.add!!.shouldContainExactly(value)
    }

    @Test
    fun `updates tags when defaultPublicationType is amtsintern`() {
        val value = "amtsintern"
        every { behaviourService.get(catalogId, "plugin.tags") } returns behaviourWithValue(value)
        val captured: CapturingSlot<TagRequest> = slot()

        initializer.invoke(payload, context)

        verify(exactly = 1) {
            documentService.updateTags(catalogId, 42, capture(captured))
        }
        captured.captured.remove shouldBe emptyList()
        captured.captured.add!!.shouldContainExactly(value)
    }

    private fun behaviourWithValue(value: String): Behaviour {
        val b = Behaviour()
        b.name = "plugin.tags"
        b.active = true
        b.data = mapOf("defaultPublicationType" to value)
        return b
    }
}
