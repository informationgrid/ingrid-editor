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

import tools.jackson.databind.JsonNode

object UvpDocumentReferences {

    data class TableDefinition(
        val fieldName: String,
        val isDecision: Boolean = false,
    )

    data class Reference(
        val tableField: String,
        val uri: String,
        val isExternalLink: Boolean,
        val validUntil: String?,
    )

    data class Diagnostic(
        val tableField: String,
        val stepIndex: Int? = null,
        val entryIndex: Int? = null,
        val message: String,
        val affectsUploadIdentity: Boolean = true,
    )

    data class ExtractionResult(
        val references: List<Reference>,
        val diagnostics: List<Diagnostic>,
    ) {
        val isReliable: Boolean
            get() = diagnostics.isEmpty()

        val isReliableForCleanup: Boolean
            get() = diagnostics.none { it.affectsUploadIdentity }
    }

    val PROCESSING_STEP_TABLES = listOf(
        TableDefinition("announcementDocs"),
        TableDefinition("applicationDocs"),
        TableDefinition("reportsRecommendationDocs"),
        TableDefinition("furtherDocs"),
        TableDefinition("considerationDocs"),
        TableDefinition("scopingDateDocs"),
        TableDefinition("scopingGeneralDocs"),
        TableDefinition("approvalDocs"),
        TableDefinition("decisionDocs", isDecision = true),
    )

    const val NEGATIVE_DECISION_TABLE = "uvpNegativeDecisionDocs"

    val PROCESSING_STEP_TABLE_FIELDS = PROCESSING_STEP_TABLES.map { it.fieldName }

    val NON_DECISION_PROCESSING_STEP_TABLE_FIELDS =
        PROCESSING_STEP_TABLES.filterNot { it.isDecision }.map { it.fieldName }

    fun extractProcessingStep(step: JsonNode): ExtractionResult = extractTables(step, PROCESSING_STEP_TABLE_FIELDS)

    fun extractNegativeDecision(document: JsonNode): ExtractionResult = extractTables(document, listOf(NEGATIVE_DECISION_TABLE))

    fun extractDocument(document: JsonNode): ExtractionResult {
        if (!document.isObject) {
            return ExtractionResult(
                emptyList(),
                listOf(Diagnostic("document", message = "Expected a document object")),
            )
        }

        val references = mutableListOf<Reference>()
        val diagnostics = mutableListOf<Diagnostic>()
        val steps = document.get("processingSteps")

        if (steps != null && !steps.isNull) {
            if (!steps.isArray) {
                diagnostics.add(Diagnostic("processingSteps", message = "Expected an array of processing steps"))
            } else {
                steps.forEachIndexed { index, step ->
                    if (!step.isObject) {
                        diagnostics.add(
                            Diagnostic(
                                "processingSteps",
                                stepIndex = index,
                                message = "Expected a processing-step object",
                            ),
                        )
                    } else {
                        val extraction = extractTables(step, PROCESSING_STEP_TABLE_FIELDS, index)
                        references.addAll(extraction.references)
                        diagnostics.addAll(extraction.diagnostics)
                    }
                }
            }
        }

        val negativeDecision = extractNegativeDecision(document)
        references.addAll(negativeDecision.references)
        diagnostics.addAll(negativeDecision.diagnostics)
        return ExtractionResult(references, diagnostics)
    }

    private fun extractTables(
        node: JsonNode,
        tableFields: List<String>,
        stepIndex: Int? = null,
    ): ExtractionResult {
        if (!node.isObject) {
            val tableField = tableFields.firstOrNull() ?: "document"
            return ExtractionResult(
                emptyList(),
                listOf(Diagnostic(tableField, stepIndex, message = "Expected a document object")),
            )
        }

        val references = mutableListOf<Reference>()
        val diagnostics = mutableListOf<Diagnostic>()

        tableFields.forEach { tableField ->
            val table = node.get(tableField)
            if (table == null || table.isNull) return@forEach
            if (!table.isArray) {
                diagnostics.add(Diagnostic(tableField, stepIndex, message = "Expected an array of documents"))
                return@forEach
            }

            table.forEachIndexed { entryIndex, entry ->
                val extraction = extractEntry(tableField, stepIndex, entryIndex, entry)
                references.addAll(extraction.references)
                diagnostics.addAll(extraction.diagnostics)
            }
        }

        return ExtractionResult(references, diagnostics)
    }

    private fun extractEntry(
        tableField: String,
        stepIndex: Int?,
        entryIndex: Int,
        entry: JsonNode,
    ): ExtractionResult {
        fun invalid(message: String) = ExtractionResult(emptyList(), listOf(Diagnostic(tableField, stepIndex, entryIndex, message)))

        val downloadUrl = if (entry.isObject) {
            entry.get("downloadURL")?.takeIf { it.isObject }
        } else {
            null
        }
        val uri = downloadUrl?.get("uri")?.takeIf { it.isString }?.asString()?.takeIf { it.isNotBlank() }
        if (downloadUrl == null || uri == null) {
            val message = if (downloadUrl == null) {
                "Missing or malformed downloadURL"
            } else {
                "Missing or malformed downloadURL.uri"
            }
            return invalid(message)
        }

        val diagnostics = mutableListOf<Diagnostic>()
        val isExternalLink = extractExternalLink(downloadUrl, tableField, stepIndex, entryIndex, diagnostics)
        val validUntil = extractValidUntil(entry, tableField, stepIndex, entryIndex, diagnostics)

        return ExtractionResult(
            listOf(Reference(tableField, uri, isExternalLink, validUntil)),
            diagnostics,
        )
    }

    private fun extractExternalLink(
        downloadUrl: JsonNode,
        tableField: String,
        stepIndex: Int?,
        entryIndex: Int,
        diagnostics: MutableList<Diagnostic>,
    ): Boolean {
        val asLinkNode = downloadUrl.get("asLink")
        val malformed = asLinkNode != null && !asLinkNode.isNull && !asLinkNode.isBoolean
        if (malformed) {
            diagnostics.add(
                Diagnostic(
                    tableField,
                    stepIndex,
                    entryIndex,
                    "Malformed downloadURL.asLink",
                    affectsUploadIdentity = false,
                ),
            )
        }
        return asLinkNode?.takeIf { it.isBoolean }?.booleanValue() ?: false
    }

    private fun extractValidUntil(
        entry: JsonNode,
        tableField: String,
        stepIndex: Int?,
        entryIndex: Int,
        diagnostics: MutableList<Diagnostic>,
    ): String? {
        val validUntilNode = entry.get("validUntil")
        if (validUntilNode == null || validUntilNode.isNull) return null

        val validUntil = validUntilNode.takeIf { it.isString }
            ?.asString()
            ?.takeIf { it.isNotBlank() }
        if (validUntil == null) {
            diagnostics.add(
                Diagnostic(
                    tableField,
                    stepIndex,
                    entryIndex,
                    "Malformed validUntil",
                    affectsUploadIdentity = false,
                ),
            )
        }
        return validUntil
    }
}
