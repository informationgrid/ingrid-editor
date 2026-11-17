/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.types

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test
import tools.jackson.databind.ObjectMapper
import tools.jackson.databind.node.ObjectNode

class UvpBaseTypeTest {

    private val objectMapper = ObjectMapper()
    private val uvpType = UvpApprovalProcedureType()
    private val negativeAssessmentType = UvpNegativePreliminaryAssessmentType()

    @Test
    fun `getUploads should extract files from all processing step types including scoping docs`() {
        val json = """
        {
            "_uuid": "1c6ee3a4-dd07-46b7-8bfa-5e46e82f5c44",
            "_type": "UvpApprovalProcedureDoc",
            "processingSteps": [
                {
                    "type": "scopeOfInvestigation",
                    "scopingDateDocs": [
                        {
                            "title": "Scoping-Protokoll inkl Stellungnahmen",
                            "downloadURL": {
                                "asLink": false,
                                "value": "Scoping-Protokoll inkl Stellungnahmen.pdf",
                                "uri": "Scoping-Protokoll inkl Stellungnahmen.pdf"
                            }
                        }
                    ],
                    "scopingGeneralDocs": [
                        {
                            "title": "Scoping-Unterlage",
                            "downloadURL": {
                                "asLink": false,
                                "value": "U-GP-7.2-01_finale_Version_2025-05-26_s.pdf",
                                "uri": "U-GP-7.2-01_finale_Version_2025-05-26_s.pdf"
                            }
                        },
                        {
                            "title": "Unterrichtung über Untersuchungsrahmen",
                            "downloadURL": {
                                "value": "Unterrichtung_Untersuchungsrahmen_s.pdf",
                                "uri": "Unterrichtung_Untersuchungsrahmen_s.pdf"
                            }
                        },
                        {
                            "title": "External Link Document",
                            "downloadURL": {
                                "asLink": true,
                                "value": "https://example.com/external.pdf",
                                "uri": "https://example.com/external.pdf"
                            }
                        }
                    ]
                },
                {
                    "type": "publicDisclosure",
                    "announcementDocs": [
                        {
                            "downloadURL": {
                                "uri": "announcement.pdf"
                            }
                        }
                    ],
                    "applicationDocs": [
                        {
                            "downloadURL": {
                                "uri": "application.pdf"
                            }
                        }
                    ],
                    "reportsRecommendationDocs": [
                        {
                            "downloadURL": {
                                "uri": "report.pdf"
                            }
                        }
                    ],
                    "furtherDocs": [
                        {
                            "downloadURL": {
                                "uri": "further.pdf"
                            }
                        }
                    ]
                },
                {
                    "type": "publicHearing",
                    "considerationDocs": [
                        {
                            "downloadURL": {
                                "uri": "consideration.pdf"
                            }
                        }
                    ]
                },
                {
                    "type": "decisionOfAdmission",
                    "approvalDocs": [
                        {
                            "downloadURL": {
                                "uri": "approval.pdf"
                            }
                        }
                    ],
                    "decisionDocs": [
                        {
                            "downloadURL": {
                                "uri": "decision.pdf"
                            }
                        }
                    ]
                }
            ]
        }
        """.trimIndent()

        val doc = Document().apply {
            data = objectMapper.readTree(json) as ObjectNode
        }

        val uploads = uvpType.getUploads(doc)

        uploads shouldContainExactlyInAnyOrder listOf(
            "Scoping-Protokoll inkl Stellungnahmen.pdf",
            "U-GP-7.2-01_finale_Version_2025-05-26_s.pdf",
            "Unterrichtung_Untersuchungsrahmen_s.pdf",
            "announcement.pdf",
            "application.pdf",
            "report.pdf",
            "further.pdf",
            "consideration.pdf",
            "approval.pdf",
            "decision.pdf",
        )
    }

    @Test
    fun `getUploads should extract negative decision docs`() {
        val json = """
        {
            "_uuid": "2c6ee3a4-dd07-46b7-8bfa-5e46e82f5c44",
            "_type": "UvpNegativePreliminaryAssessmentDoc",
            "uvpNegativeDecisionDocs": [
                {
                    "downloadURL": {
                        "uri": "negative_decision.pdf"
                    }
                }
            ]
        }
        """.trimIndent()

        val doc = Document().apply {
            data = objectMapper.readTree(json) as ObjectNode
        }

        val uploads = negativeAssessmentType.getUploads(doc)

        uploads shouldBe listOf("negative_decision.pdf")
    }

    @Test
    fun `getUploads should return empty list when no uploads or processing steps exist`() {
        val json = """
        {
            "_uuid": "3c6ee3a4-dd07-46b7-8bfa-5e46e82f5c44",
            "_type": "UvpApprovalProcedureDoc"
        }
        """.trimIndent()

        val doc = Document().apply {
            data = objectMapper.readTree(json) as ObjectNode
        }

        val uploads = uvpType.getUploads(doc)

        uploads shouldBe emptyList()
    }
}
