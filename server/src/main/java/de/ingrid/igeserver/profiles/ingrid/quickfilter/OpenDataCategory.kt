package de.ingrid.igeserver.profiles.ingrid.quickfilter

import de.ingrid.igeserver.model.QuickFilter
import org.springframework.stereotype.Component

@Component
class OpenDataCategory : QuickFilter() {
    override val id: String = "selectOpenDataCategory"
    override val label: String = ""
    override val filter: String = ""
    override val codelistId: String? = "6400"

    override fun filter(parameter: List<*>?) = """
        jsonb_path_exists(jsonb_strip_nulls(data), '$.openDataCategories')
        AND (jsonb_typeof(data -> 'openDataCategories') = 'array')
        AND EXISTS(SELECT
             FROM jsonb_array_elements(data -> 'openDataCategories') as s
             WHERE (s ->> 'key') = '${parameter?.get(0)}'
        )"""
}