/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.utils.UploadInfo
import java.time.OffsetDateTime

val sqlStepsPublished = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND doc.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state = 'PUBLISHED'
""".trimIndent()

val sqlStepsWithDrafts = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, elems as step, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc,
             jsonb_array_elements(doc.data -> 'processingSteps') elems
        WHERE dw.catalog_id = catalog.id
          AND doc.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND (doc.state = 'PUBLISHED' OR doc.state = 'DRAFT' OR doc.state = 'DRAFT_AND_PUBLISHED' OR doc.state = 'PENDING')
""".trimIndent()

val sqlNegativeDecisionDocsPublished = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND doc.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND doc.state = 'PUBLISHED'
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
""".trimIndent()

val sqlNegativeDecisionDocsWithDraft = """
        SELECT doc.uuid as uuid, catalog.identifier as catalogId, doc.data as negativeDocs, doc.title, doc.type
        FROM catalog,
             document_wrapper dw,
             document doc
        WHERE dw.catalog_id = catalog.id
          AND doc.catalog_id = catalog.id
          AND catalog.type = 'uvp'
          AND dw.deleted = 0
          AND dw.category = 'data'
          AND dw.uuid = doc.uuid
          AND (doc.state = 'PUBLISHED' OR doc.state = 'DRAFT' OR doc.state = 'DRAFT_AND_PUBLISHED' OR doc.state = 'PENDING')
          AND doc.data -> 'uvpNegativeDecisionDocs' IS NOT NULL
""".trimIndent()

fun getUrlsFromJsonField(json: JsonNode): List<UploadInfo> = (
    getUrlsFromJsonFieldTable(json, "applicationDocs") +
        getUrlsFromJsonFieldTable(json, "announcementDocs") +
        getUrlsFromJsonFieldTable(json, "reportsRecommendationDocs") +
        getUrlsFromJsonFieldTable(json, "furtherDocs") +
        getUrlsFromJsonFieldTable(json, "considerationDocs") +
        getUrlsFromJsonFieldTable(json, "approvalDocs") +
        getUrlsFromJsonFieldTable(json, "decisionDocs")
    )

fun getUrlsFromJsonFieldTable(json: JsonNode, tableField: String): List<UploadInfo> = json.get(tableField)
    ?.filter { !it.get("downloadURL").get("asLink").asBoolean() }
    ?.map { mapToUploadInfo(it) }
    ?: emptyList()

fun sqlDecisionDateBefore(catalogId: String, date: OffsetDateTime): String = """
    SELECT dw.id, doc.id, doc.type
    FROM catalog,
         document_wrapper dw,
         document doc,
         jsonb_array_elements(doc.data -> 'processingSteps') elems
    WHERE catalog.identifier = '$catalogId'
      AND doc.catalog_id = dw.catalog_id
      AND catalog.id = dw.catalog_id
      AND catalog.type = 'uvp'
      AND dw.deleted = 0
      AND dw.category = 'data'
      AND dw.uuid = doc.uuid
      AND doc.state = 'PUBLISHED'
      AND elems->>'type' = 'decisionOfAdmission' AND (elems->>'decisionDate')::timestamptz <= '$date'
""".trimIndent()

fun sqlUpdateValidDate(docId: Int, tableField: String): String = """
        UPDATE document
        SET data = jsonb_set(
        data,
        '{processingSteps}',
        (SELECT jsonb_agg(
                        CASE
                            WHEN jsonb_typeof(step -> '$tableField') = 'array' THEN
                                        jsonb_set(
                                                step,
                                                '{$tableField}',
                                                (SELECT jsonb_agg(
                                                                CASE
                                                                    WHEN doc ->> 'validUntil' IS NULL OR
                                                                         (doc ->> 'validUntil')::timestamp >=
                                                                         (CURRENT_DATE::timestamp AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'UTC' THEN
                                                                        jsonb_set(
                                                                                doc,
                                                                                '{validUntil}',
                                                                                to_jsonb(to_char(
                                                                                    ((CURRENT_DATE::timestamp - INTERVAL '1 day') AT TIME ZONE 'Europe/Berlin') AT TIME ZONE 'UTC'
                                                                                , 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')),
                                                                                TRUE
                                                                        )
                                                                    ELSE doc
                                                                    END
                                                        )
                                                 FROM jsonb_array_elements(step -> '$tableField') doc),
                                                TRUE
                                        )
                                    ELSE step
                                    END
                        )
                 FROM jsonb_array_elements(data -> 'processingSteps') step),
                TRUE
                   )
        WHERE id = $docId
""".trimIndent()

fun sqlUpdateValidDateNegativeDoc(docId: Int): String = """
    UPDATE document
        SET data = CASE
           WHEN EXISTS (SELECT 1
                        FROM jsonb_object_keys(data) AS keys
                        WHERE keys = 'uvpNegativeDecisionDocs') THEN
               jsonb_set(
                       data,
                       '{uvpNegativeDecisionDocs}',
                       (SELECT jsonb_agg(
                                       CASE
                                           WHEN doc ->> 'validUntil' IS NULL OR
                                                (doc ->> 'validUntil')::timestamp >=
                                                (CURRENT_DATE::timestamp AT TIME ZONE 'Europe/Berlin') AT TIME ZONE
                                                'UTC' THEN
                                               jsonb_set(
                                                       doc,
                                                       '{validUntil}',
                                                       to_jsonb(to_char(
                                                               ((CURRENT_DATE::timestamp - INTERVAL '1 day') AT TIME ZONE 'Europe/Berlin') AT TIME ZONE
                                                               'UTC'
                                                           , 'YYYY-MM-DD"T"HH24:MI:SS.MSZ')),
                                                       TRUE
                                               )
                                           ELSE doc
                                           END
                               )
                        FROM jsonb_array_elements(data -> 'uvpNegativeDecisionDocs') doc),
                       TRUE
               )
           ELSE data
           END
   WHERE id = $docId
"""

private fun mapToUploadInfo(it: JsonNode): UploadInfo {
    val validUntilDateField = it.get("validUntil")
    val expiredDate =
        if (validUntilDateField == null || validUntilDateField.isNull) null else validUntilDateField.asText()
    return UploadInfo("", it.get("downloadURL").get("uri").textValue(), expiredDate)
}
