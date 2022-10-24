package de.ingrid.igeserver.profiles.uvp.api

import org.intellij.lang.annotations.Language

/*

 */
@Language("PostgreSQL")
fun getEiaStatisiticSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT jsonb_array_elements(document1.data->'eiaNumbers') ->> 'key' as eia, Count(distinct document_wrapper.uuid) AS num
    FROM document_wrapper JOIN document document1 ON document_wrapper.published = document1.id,
         jsonb_array_elements(document1.data -> 'processingSteps') as steps
    WHERE document_wrapper.catalog_id = $catalogId
      AND steps ->>'type' = 'decisionOfAdmission'
      AND jsonb_array_length(data -> 'eiaNumbers') > 0
      AND (document_wrapper.type = 'UvpApprovalProcedureDoc' OR document_wrapper.type = 'UvpLineDeterminationDoc' OR document_wrapper.type = 'UvpSpatialPlanningProcedureDoc')
      ${addDateLimit(startDate, endDate)}
    GROUP BY eia
    ORDER BY num DESC;
""".trimIndent()

/*

 */
@Language("PostgreSQL")
fun getSuccessfulPrelimCountSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT Count(*)
    FROM document_wrapper JOIN document document1 ON document_wrapper.published = document1.id,
        jsonb_array_elements(document1.data -> 'processingSteps') as steps
    WHERE document_wrapper.catalog_id = $catalogId
        AND document1.data -> 'prelimAssessment' = 'true'
        ${addDateLimit(startDate, endDate)}
""".trimIndent()
/*

 */
@Language("PostgreSQL")
fun getNegativePrelimCountSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT Count(*)
    FROM document_wrapper JOIN document document1 ON document_wrapper.published = document1.id
    WHERE document_wrapper.catalog_id = $catalogId
      AND document_wrapper.type = 'UvpNegativePreliminaryAssessmentDoc'
      ${if (startDate != null) "AND (document1.data ->>'decisionDate')\\:\\:date >= '$startDate'\\:\\:date" else ""}
      ${if (endDate != null) "AND (document1.data ->>'decisionDate')\\:\\:date <= '$endDate'\\:\\:date" else ""}
""".trimIndent()

/*
    Get receipt date and latest decision date (in case there are more than one) for datasets of type
    'Zulassungsverfahren', 'Linienbestimmung' and 'Raumordnungsverfahren'.
    
 */
@Language("PostgreSQL")
fun getReceiptAndLatestDecisionDatesSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT (document1.data ->> 'receiptDate') as receiptDate,
           (steps ->> 'decisionDate') as decisionDate
    FROM document_wrapper JOIN document document1 ON document_wrapper.published = document1.id,
         jsonb_array_elements(document1.data -> 'processingSteps') as steps
    WHERE document_wrapper.catalog_id = $catalogId
      AND (document_wrapper.type = 'UvpApprovalProcedureDoc' OR document_wrapper.type = 'UvpLineDeterminationDoc' OR
           document_wrapper.type = 'UvpSpatialPlanningProcedureDoc')
      AND jsonb_array_length(data -> 'processingSteps') > 0
      AND (document1.data -> 'receiptDate') != 'null'
      AND (steps ->> 'type') = 'decisionOfAdmission'
      ${addDateLimit(startDate, endDate)}
""".trimIndent()

@Language("PostgreSQL")
private fun addDateLimit(startDate: String?, endDate: String?) = """
    ${if (startDate != null) "AND CAST((steps ->>'decisionDate') as date) >= CAST('$startDate' as date)" else ""}
    ${if (endDate != null) "AND CAST((steps ->>'decisionDate') as date) <= CAST('$endDate' as date)" else ""}
    AND CAST((steps ->>'decisionDate') as date) = (SELECT max(CAST((steps2 ->>'decisionDate') as date) )
    FROM document_wrapper dw2 JOIN document document2 ON dw2.published = document2.id,
    jsonb_array_elements(document2.data -> 'processingSteps') as steps2
    WHERE document_wrapper.id = dw2.id)
""".trimIndent()