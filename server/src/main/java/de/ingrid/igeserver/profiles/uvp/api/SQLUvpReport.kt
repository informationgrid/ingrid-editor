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
      AND (steps ->>'decisionDate') != 'null'
      ${if (startDate != null) "AND (steps ->>'decisionDate')::date >= '$startDate'::date" else ""}
      ${if (endDate != null) "AND (steps ->>'decisionDate')::date <= '$endDate'::date" else ""}
    GROUP BY eia
    ORDER BY num DESC;
""".trimIndent()

/*

 */
@Language("PostgreSQL")
fun getSuccessfulPrelimCountSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT Count(*)
    FROM document_wrapper JOIN document document1 ON document_wrapper.published = document1.id
    WHERE document_wrapper.catalog_id = $catalogId
        AND document1.data -> 'prelimAssessment' = 'true'
        ${if (startDate != null) "AND (steps ->>'decisionDate')::date >= '$startDate'::date" else ""}
        ${if (endDate != null) "AND (steps ->>'decisionDate')::date <= '$endDate'::date" else ""}
""".trimIndent()
/*

 */
@Language("PostgreSQL")
fun getNegativePrelimCountSQL(catalogId: Int, startDate: String?, endDate: String?) = """
    SELECT Count(*)
    FROM document_wrapper JOIN document document1 ON document_wrapper.published = document1.id
    WHERE document_wrapper.catalog_id = $catalogId
      AND document_wrapper.type = 'UvpNegativePreliminaryAssessmentDoc'
      AND (document1.data ->> 'decisionDate') != 'null'
      ${if (startDate != null) "AND (steps ->>'decisionDate')::date >= '$startDate'::date" else ""}
      ${if (endDate != null) "AND (steps ->>'decisionDate')::date <= '$endDate'::date" else ""};
""".trimIndent()

/*

 */
@Language("PostgreSQL")
fun getReceiptAndLatestDecisionDatesSQL(catalogId: Int) = """
    SELECT result.receiptDate,
           result.decisionDate
    FROM (SELECT document1.uuid,
                 (document1.data ->> 'receiptDate') as                                                  receiptDate,
                 (steps ->> 'decisionDate')         as                                                  decisionDate,
                 row_number() over (PARTITION BY document1.uuid ORDER BY steps ->> 'decisionDate' DESC) nth
          FROM document_wrapper JOIN document document1 ON document_wrapper.published = document1.id,
               jsonb_array_elements(document1.data -> 'processingSteps') as steps
          WHERE document_wrapper.catalog_id = $catalogId
            AND (document_wrapper.type = 'UvpApprovalProcedureDoc' OR document_wrapper.type = 'UvpLineDeterminationDoc' OR
                 document_wrapper.type = 'UvpSpatialPlanningProcedureDoc')
            AND jsonb_array_length(data -> 'processingSteps') > 0
            AND (document1.data -> 'receiptDate') != 'null'
            AND steps ->> 'type' = 'decisionOfAdmission') result
    WHERE nth = 1;
""".trimIndent()