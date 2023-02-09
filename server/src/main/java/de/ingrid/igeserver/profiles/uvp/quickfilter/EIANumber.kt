package de.ingrid.igeserver.profiles.uvp.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class EIANumber : QuickFilter() {
    override val id = "eapNumber"
    override val label = ""
    override val filter = ""
    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?) = """jsonb_path_exists(jsonb_strip_nulls(data), '$.eiaNumbers')
          AND EXISTS(SELECT
                     FROM jsonb_array_elements(data -> 'eiaNumbers') as s
                     WHERE CAST((s ->> 'key') as numeric) = ${parameter?.get(0)}
                    )
    """.trimIndent()
    override val codelistIdFromBehaviour = "plugin.uvp.eia-number::uvpCodelist::9000"
}