/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.persistence.filter.publish

import de.ingrid.igeserver.api.ValidationException
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.persistence.filter.PrePublishPayload
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.profiles.test.types.TestType
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.services.DocumentData
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.DocumentState
import de.ingrid.igeserver.utils.SpringContext
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.string.shouldContain
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkObject

class PreDefaultDocumentPublisherTest :
    FunSpec({

        val docService = mockk<DocumentService>()
        val publisher = PreDefaultDocumentPublisher(docService)

        beforeAny {
            every { docService.getReferencedWrapperIds(any(), any()) } returns setOf(1)
            mockkObject(SpringContext.Companion)
            every { SpringContext.getBean(DateService::class.java) } answers {
                DateService()
            }
        }

        fun mockRefWithTag(tags: List<String>) {
            every { docService.getDocumentFromCatalog(any(), any()) } returns DocumentData(
                DocumentWrapper().apply { this.tags = tags },
                Document().apply { state = DocumentState.PUBLISHED },
            )
        }

        test("internet should accept internet references") {
            mockRefWithTag(emptyList())

            val payload = PrePublishPayload(TestType(), "", Document(), DocumentWrapper())
            publisher.invoke(payload, DefaultContext("", "", null, null))
        }

        test("internet should not accept intranet references") {
            mockRefWithTag(listOf("intranet"))
            val payload = PrePublishPayload(TestType(), "", Document(), DocumentWrapper())
            shouldThrow<ValidationException> {
                publisher.invoke(payload, DefaultContext("", "", null, null))
            }.also {
                it.data?.get("error").toString() shouldContain "Reference has wrong publication type condition"
            }
        }

        test("internet should not accept amtsintern references") {
            mockRefWithTag(listOf("amtsintern"))
            val payload = PrePublishPayload(TestType(), "", Document(), DocumentWrapper())
            shouldThrow<ValidationException> {
                publisher.invoke(payload, DefaultContext("", "", null, null))
            }
        }

        test("intranet should accept internet references") {
            mockRefWithTag(emptyList())
            val payload =
                PrePublishPayload(TestType(), "", Document(), DocumentWrapper().apply { tags = listOf("intranet") })
            publisher.invoke(payload, DefaultContext("", "", null, null))
        }

        test("intranet should accept intranet references") {
            mockRefWithTag(listOf("intranet"))
            val payload =
                PrePublishPayload(TestType(), "", Document(), DocumentWrapper().apply { tags = listOf("intranet") })
            publisher.invoke(payload, DefaultContext("", "", null, null))
        }

        test("intranet should not accept amtsintern references") {
            mockRefWithTag(listOf("amtsintern"))
            val payload =
                PrePublishPayload(TestType(), "", Document(), DocumentWrapper().apply { tags = listOf("intranet") })
            shouldThrow<ValidationException> {
                publisher.invoke(payload, DefaultContext("", "", null, null))
            }
        }

        test("amtsintern should accept internet references") {
            mockRefWithTag(emptyList())
            val payload =
                PrePublishPayload(TestType(), "", Document(), DocumentWrapper().apply { tags = listOf("amtsintern") })
            publisher.invoke(payload, DefaultContext("", "", null, null))
        }

        test("amtsintern should accept intranet references") {
            mockRefWithTag(listOf("intranet"))
            val payload =
                PrePublishPayload(TestType(), "", Document(), DocumentWrapper().apply { tags = listOf("amtsintern") })
            publisher.invoke(payload, DefaultContext("", "", null, null))
        }

        test("amtsintern should accept amtsintern references") {
            mockRefWithTag(listOf("amtsintern"))
            val payload =
                PrePublishPayload(TestType(), "", Document(), DocumentWrapper().apply { tags = listOf("amtsintern") })
            publisher.invoke(payload, DefaultContext("", "", null, null))
        }
    })
