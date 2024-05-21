package de.ingrid.igeserver.profiles.ingrid.quickfilter

import de.ingrid.igeserver.model.KeywordFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class KeywordFilterIngrid: KeywordFilter() {
    override val profiles = listOf("ingrid", "uvp")

    override val id = "KeywordFilterIngrid"
    override val label = "<group label will be used>"

    override val parameters: List<String> = emptyList()

    override val filter = ""

    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?) = """
        (${parameter?.joinToString(" OR ") { "data ->> 'description' ILIKE '%$it%'" }}) OR
        (${parameter?.joinToString(" OR ") { "title ILIKE '%$it%'" }})
        """
}