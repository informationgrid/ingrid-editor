package de.ingrid.igeserver.profiles.ingrid.quickfilter

import de.ingrid.igeserver.model.KeywordFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class KeywordFilterIngrid: KeywordFilter() {
    override val profiles = listOf("ingrid")

    override val id = "KeywordFilterIngrid"
    override val label = "<group label will be used>"

    override val parameters: List<String> = emptyList()

    override val filter = ""

    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?): String {
        val titleCondition = parameter?.joinToString(" OR ") { "title ILIKE '%$it%'" }
        val descriptionCondition = parameter?.joinToString(" OR ") { "data ->> 'description' ILIKE '%$it%'" }
        val alternateTitleCondition = parameter?.joinToString(" OR ") { "data ->> 'alternateTitle' ILIKE '%$it%'" }
        val freeKeywordsCondition = parameter?.joinToString(" OR ") { "EXISTS (SELECT 1 FROM jsonb_array_elements(data -> 'keywords' -> 'free') AS keyword WHERE keyword ->> 'label' ILIKE '%$it%')" }

        return """
            ($titleCondition)
            OR ($descriptionCondition)
            OR ($alternateTitleCondition)
            OR ($freeKeywordsCondition)
        """
    }
}