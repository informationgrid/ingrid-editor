package de.ingrid.igeserver.profiles.uvp.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class ProcessStep : QuickFilter() {
    override val id = "processStep"
    override val label = ""
    override val filter = ""

    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?) = """jsonb_path_exists(jsonb_strip_nulls(data), '$.processingSteps')
          AND EXISTS(SELECT
                     FROM jsonb_array_elements(data -> 'processingSteps') as s
                     WHERE CAST((s ->> 'type') as text) = '${parameter?.get(0)}'
                    )
    """.trimIndent()
    override val parameters = listOf(
        "publicDisclosure", "decisionOfAdmission", "publicHearing"
    )
}