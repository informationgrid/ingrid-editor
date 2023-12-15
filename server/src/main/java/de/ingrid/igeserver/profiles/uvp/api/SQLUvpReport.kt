/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.uvp.api

import org.intellij.lang.annotations.Language

/*
    Get the statistic of all EIA-numbers in all datasets in a given time-range of the decision-date.
    Moreover only datasets of type 'Zulassungsverfahren', 'Linienbestimmung' and 'Raumordnungsverfahren'
    are considered.
    The result is filtered by a given time-range on the decision date. If multiple decision-dates
    exist, the most recent one is used.
 */
@Language("PostgreSQL")
fun getEiaStatisiticSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT jsonb_array_elements(document1.data->'eiaNumbers') ->> 'key' as eia, Count(distinct document_wrapper.uuid) AS num
    FROM document_wrapper JOIN document document1 ON document_wrapper.uuid = document1.uuid,
         jsonb_array_elements(document1.data -> 'processingSteps') as steps
    WHERE document_wrapper.catalog_id = $catalogId
      AND document1.state = 'PUBLISHED'
      AND document_wrapper.deleted = 0
      AND steps ->>'type' = 'decisionOfAdmission'
      AND jsonb_array_length(data -> 'eiaNumbers') > 0
      AND (document_wrapper.type = 'UvpApprovalProcedureDoc' OR document_wrapper.type = 'UvpLineDeterminationDoc' OR document_wrapper.type = 'UvpSpatialPlanningProcedureDoc')
      ${addDateLimit(startDate, endDate)}
    GROUP BY eia
    ORDER BY num DESC;
""".trimIndent()

/*
    Get the count of all datasets in a given time-range of the decision-date.
    Moreover only datasets of type 'Zulassungsverfahren', 'Linienbestimmung' and 'Raumordnungsverfahren'
    are considered.
    The result is filtered by a given time-range on the decision date. If multiple decision-dates
    exist, the most recent one is used.
 */
@Language("PostgreSQL")
fun getProcedureCountSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT Count(distinct document_wrapper.uuid) AS num
    FROM document_wrapper JOIN document document1 ON document_wrapper.uuid = document1.uuid,
         jsonb_array_elements(document1.data -> 'processingSteps') as steps
    WHERE document_wrapper.catalog_id = $catalogId
      AND document1.state = 'PUBLISHED'
      AND document_wrapper.deleted = 0
      AND steps ->>'type' = 'decisionOfAdmission'
      AND jsonb_array_length(data -> 'eiaNumbers') > 0
      AND (document_wrapper.type = 'UvpApprovalProcedureDoc' OR document_wrapper.type = 'UvpLineDeterminationDoc' OR document_wrapper.type = 'UvpSpatialPlanningProcedureDoc')
      ${addDateLimit(startDate, endDate)}
    ;
""".trimIndent()

/*
    Count all datasets where preliminary assessment is set to `true`.
    The result is filtered by a given time-range on the decision date. If multiple decision-dates
    exist, the most recent one is used.
 */
@Language("PostgreSQL")
fun getSuccessfulPrelimCountSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT Count(*)
    FROM document_wrapper JOIN document document1 ON document_wrapper.uuid = document1.uuid,
        jsonb_array_elements(document1.data -> 'processingSteps') as steps
    WHERE document_wrapper.catalog_id = $catalogId
        AND document1.state = 'PUBLISHED'
        AND document_wrapper.deleted = 0
        AND document1.data -> 'prelimAssessment' = 'true'
        ${addDateLimit(startDate, endDate)}
""".trimIndent()

/*
    Count all negative preliminary assessments. The result is filtered by a given time-range on the
    decision date, which can only exist once for this dataset type.
 */
@Language("PostgreSQL")
fun getNegativePrelimCountSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT Count(*)
    FROM document_wrapper JOIN document document1 ON document_wrapper.uuid = document1.uuid
    WHERE document_wrapper.catalog_id = $catalogId
      AND document1.state = 'PUBLISHED'
      AND document_wrapper.deleted = 0
      AND document_wrapper.type = 'UvpNegativePreliminaryAssessmentDoc'
      ${if (startDate != null) "AND (document1.data ->>'decisionDate')\\:\\:date >= '$startDate'\\:\\:date" else ""}
      ${if (endDate != null) "AND (document1.data ->>'decisionDate')\\:\\:date <= '$endDate'\\:\\:date" else ""}
""".trimIndent()

/*
    Get receipt-date and latest decision date (in case there are more than one) for datasets of type
    'Zulassungsverfahren', 'Linienbestimmung' and 'Raumordnungsverfahren'.
    In case the receipt-date is missing (since it only was required at a later point in time), we also get
    the start-date of the disclosure-date, which is used instead.
    The result is filtered by a given time-range on the decision date. If multiple decision-dates
    exist, the most recent one is used.
 */
@Language("PostgreSQL")
fun getReceiptAndLatestDecisionDatesSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT DISTINCT (document1.data ->> 'receiptDate') as receiptDate,
           (stepsDisclosureDate -> 'disclosureDate' ->> 'start') as disclosureStartDate,
           (steps ->> 'decisionDate') as decisionDate
    FROM document_wrapper JOIN document document1 ON document_wrapper.uuid = document1.uuid,
         jsonb_array_elements(document1.data -> 'processingSteps') as steps,
         jsonb_array_elements(document1.data -> 'processingSteps') as stepsDisclosureDate
    WHERE document_wrapper.catalog_id = $catalogId
      AND document1.state = 'PUBLISHED'
      AND document_wrapper.deleted = 0
      AND (document_wrapper.type = 'UvpApprovalProcedureDoc' OR document_wrapper.type = 'UvpLineDeterminationDoc' OR
           document_wrapper.type = 'UvpSpatialPlanningProcedureDoc')
      AND jsonb_array_length(data -> 'processingSteps') > 0
      AND (steps ->> 'type') = 'decisionOfAdmission'
      AND ((document1.data -> 'receiptDate') != 'null' OR (stepsDisclosureDate ->> 'type') = 'publicDisclosure')
      ${addDateLimit(startDate, endDate)}
""".trimIndent()

/*
    Filter decision date to be contained between start- and end-date. When multiple decision dates exist
    then the most recent one is used for comparison.
 */
@Language("PostgreSQL")
private fun addDateLimit(startDate: String?, endDate: String?) = """
    ${if (startDate != null) "AND CAST((steps ->>'decisionDate') as date) >= CAST('$startDate' as date)" else ""}
    ${if (endDate != null) "AND CAST((steps ->>'decisionDate') as date) <= CAST('$endDate' as date)" else ""}
    AND CAST((steps ->>'decisionDate') as date) = (SELECT max(CAST((steps2 ->>'decisionDate') as date) )
    FROM document_wrapper dw2 JOIN document document2 ON dw2.uuid = document2.uuid,
    jsonb_array_elements(document2.data -> 'processingSteps') as steps2
    WHERE document_wrapper.id = dw2.id AND document1.state = 'PUBLISHED'
      AND document_wrapper.deleted = 0)
""".trimIndent()
