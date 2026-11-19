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
package de.ingrid.igeserver.profiles.uvp

import io.kotest.matchers.collections.shouldContainExactlyInAnyOrder
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test
import tools.jackson.module.kotlin.jacksonObjectMapper
import java.nio.file.Files
import java.nio.file.Path

class UvpDocumentReferencesTest {

    private val objectMapper = jacksonObjectMapper()

    @Test
    fun `registry matches actual frontend upload table definitions`() {
        val frontendRoot = listOf(Path.of("frontend"), Path.of("../frontend"))
            .firstOrNull { Files.isDirectory(it) }
            ?: error("Could not locate frontend source directory")
        val uvpShared = Files.readString(frontendRoot.resolve("src/profiles/uvp/doctypes/uvp-shared.ts"))
        val negativeAssessment = Files.readString(
            frontendRoot.resolve("src/profiles/uvp/doctypes/negative-preliminary-assessment.doctype.ts"),
        )
        val tableFieldPattern = Regex("""addTable\s*\(\s*["']([A-Za-z][A-Za-z0-9]*Docs)["']""")
        val negativeDecisionField = Regex(
            """UVP_NEGATIVE_DECISION_DOCS_FIELD\s*=\s*["']([A-Za-z][A-Za-z0-9]*Docs)["']""",
        ).find(negativeAssessment)?.groupValues?.get(1)
        val negativeDecisionFieldIsUsed = Regex(
            """addTable\s*\(\s*UVP_NEGATIVE_DECISION_DOCS_FIELD\s*,""",
        ).containsMatchIn(negativeAssessment)
        val processingStepTables = tableFieldPattern.findAll(uvpShared).map { it.groupValues[1] }.toList()
        val negativeDecisionTables = tableFieldPattern.findAll(negativeAssessment).map { it.groupValues[1] }.toList()

        processingStepTables shouldContainExactlyInAnyOrder UvpDocumentReferences.PROCESSING_STEP_TABLE_FIELDS
        (negativeDecisionTables + listOfNotNull(negativeDecisionField)) shouldContainExactlyInAnyOrder
            listOf(UvpDocumentReferences.NEGATIVE_DECISION_TABLE)
        negativeDecisionField shouldBe UvpDocumentReferences.NEGATIVE_DECISION_TABLE
        negativeDecisionFieldIsUsed shouldBe true
        UvpDocumentReferences.NON_DECISION_PROCESSING_STEP_TABLE_FIELDS shouldBe
            UvpDocumentReferences.PROCESSING_STEP_TABLE_FIELDS - "decisionDocs"
    }

    @Test
    fun `extracts references from every registered processing-step table`() {
        val tablesByStep = linkedMapOf(
            "scopeOfInvestigation" to listOf("scopingDateDocs", "scopingGeneralDocs"),
            "publicDisclosure" to listOf(
                "announcementDocs",
                "applicationDocs",
                "reportsRecommendationDocs",
                "furtherDocs",
            ),
            "publicHearing" to listOf("considerationDocs"),
            "decisionOfAdmission" to listOf("approvalDocs", "decisionDocs"),
        )
        val processingSteps = tablesByStep.entries.joinToString(",", "[", "]") { (stepType, tableFields) ->
            val tables = tableFields.joinToString(",") { tableField ->
                "\"$tableField\":[{\"downloadURL\":{\"uri\":\"$tableField/report.pdf\"}}]"
            }
            """{"type":"$stepType",$tables}"""
        }
        val document = objectMapper.readTree("""{"processingSteps":$processingSteps}""")

        val extraction = UvpDocumentReferences.extractDocument(document)

        extraction.references.map { it.tableField } shouldContainExactlyInAnyOrder
            UvpDocumentReferences.PROCESSING_STEP_TABLE_FIELDS
        extraction.isReliable shouldBe true
    }

    @Test
    fun `extracts upload references with table path and validity metadata`() {
        val step = objectMapper.readTree(
            """
            {
              "type": "scopeOfInvestigation",
              "scopingDateDocs": [
                {
                  "downloadURL": { "uri": "folder/nested/report.pdf" },
                  "validUntil": "2030-01-02"
                }
              ]
            }
            """,
        )

        val extraction = UvpDocumentReferences.extractProcessingStep(step)

        extraction.isReliable shouldBe true
        extraction.references shouldBe listOf(
            UvpDocumentReferences.Reference(
                tableField = "scopingDateDocs",
                uri = "folder/nested/report.pdf",
                isExternalLink = false,
                validUntil = "2030-01-02",
            ),
        )
    }

    @Test
    fun `missing and null tables are empty`() {
        val absent = UvpDocumentReferences.extractDocument(objectMapper.readTree("{}"))
        val nullTables = UvpDocumentReferences.extractDocument(
            objectMapper.readTree("""{"processingSteps": [{"type":"publicDisclosure","announcementDocs": null}]}"""),
        )

        absent.references shouldBe emptyList()
        absent.diagnostics shouldBe emptyList()
        nullTables.references shouldBe emptyList()
        nullTables.diagnostics shouldBe emptyList()
    }

    @Test
    fun `only explicit true asLink marks an external link`() {
        val step = objectMapper.readTree(
            """
            {
              "type": "publicDisclosure",
              "applicationDocs": [
                { "downloadURL": { "uri": "missing-as-link.pdf" } },
                { "downloadURL": { "asLink": false, "uri": "false-as-link.pdf" } },
                { "downloadURL": { "asLink": true, "uri": "https://example.test/document" } }
              ]
            }
            """,
        )

        val extraction = UvpDocumentReferences.extractProcessingStep(step)

        extraction.references.map { it.isExternalLink } shouldBe listOf(false, false, true)
        extraction.isReliable shouldBe true
    }

    @Test
    fun `cleanup reliability ignores metadata diagnostics but rejects unknown upload identities`() {
        val metadata = UvpDocumentReferences.extractDocument(
            objectMapper.readTree(
                """{"processingSteps":[{"applicationDocs":[{"downloadURL":{"asLink":"unknown","uri":"upload.pdf"},"validUntil":""}]}]}""",
            ),
        )
        val unknownPath = UvpDocumentReferences.extractDocument(
            objectMapper.readTree(
                """{"processingSteps":[{"applicationDocs":[{"downloadURL":{"uri":12}}]}]}""",
            ),
        )

        metadata.isReliable shouldBe false
        metadata.isReliableForCleanup shouldBe true
        metadata.references.single().isExternalLink shouldBe false
        metadata.diagnostics.all { !it.affectsUploadIdentity } shouldBe true
        unknownPath.isReliableForCleanup shouldBe false
    }

    @Test
    fun `malformed tables and entries produce diagnostics without hiding valid references`() {
        val step = objectMapper.readTree(
            """
            {
              "processingSteps": [
                {
                  "type": "publicDisclosure",
                  "applicationDocs": [
                    { "downloadURL": { "uri": "valid.pdf" } },
                    null,
                    { "downloadURL": "invalid" },
                    { "downloadURL": { "uri": 12 } },
                    { "downloadURL": { "asLink": "true", "uri": "ambiguous.pdf" } }
                  ]
                },
                {
                  "type": "decisionOfAdmission",
                  "decisionDocs": { "downloadURL": { "uri": "not-an-array.pdf" } }
                }
              ]
            }
            """,
        )

        val extraction = UvpDocumentReferences.extractDocument(step)

        extraction.references.map { it.uri } shouldContainExactlyInAnyOrder listOf("valid.pdf", "ambiguous.pdf")
        extraction.isReliable shouldBe false
        extraction.diagnostics.size shouldBe 5
        UvpDocumentReferences.extractProcessingStep(objectMapper.readTree("null")).isReliable shouldBe false
    }

    @Test
    fun `extracts negative-decision documents independently`() {
        val document = objectMapper.readTree(
            """{"uvpNegativeDecisionDocs": [{"downloadURL": {"uri": "negative.pdf"}}]}""",
        )

        val extraction = UvpDocumentReferences.extractNegativeDecision(document)

        extraction.references.map { it.tableField } shouldBe listOf(UvpDocumentReferences.NEGATIVE_DECISION_TABLE)
        extraction.references.single().uri shouldBe "negative.pdf"
        extraction.isReliable shouldBe true
    }

    @Test
    fun `complete document includes processing-step and negative-decision references`() {
        // The co-occurrence is synthetic: this type-agnostic extractor test covers both supported data locations.
        val document = objectMapper.readTree(
            """
            {
              "processingSteps": [
                {
                  "type": "decisionOfAdmission",
                  "decisionDocs": [{ "downloadURL": { "uri": "decision.pdf" } }]
                }
              ],
              "uvpNegativeDecisionDocs": [
                { "downloadURL": { "asLink": true, "uri": "https://example.test/negative" } }
              ]
            }
            """,
        )

        val extraction = UvpDocumentReferences.extractDocument(document)

        extraction.references.map { it.tableField } shouldBe
            listOf("decisionDocs", UvpDocumentReferences.NEGATIVE_DECISION_TABLE)
        extraction.references.map { it.isExternalLink } shouldBe listOf(false, true)
        extraction.diagnostics shouldBe emptyList()
    }
}
