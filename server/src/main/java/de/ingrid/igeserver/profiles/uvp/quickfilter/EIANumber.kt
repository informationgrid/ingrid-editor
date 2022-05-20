package de.ingrid.igeserver.profiles.uvp.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class EIANumber : QuickFilter() {
    override val id = "eapNumber"
    override val label = ""
    @Language("PostgreSQL")
    override val filter = """jsonb_path_exists(jsonb_strip_nulls(data), '$.eiaNumbers')
          AND EXISTS(SELECT
                     FROM jsonb_array_elements(data -> 'eiaNumbers') as s
                     WHERE (s ->> 'key')\:\:numeric = ?
                    )
    """.trimIndent()
    override val codelistIdFromBehaviour = "plugin.uvp.eia-number::uvpCodelist::9000"
}