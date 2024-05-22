package de.ingrid.igeserver.profiles.uvp.quickfilter

import de.ingrid.igeserver.model.KeywordFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class KeywordFilterUvp: KeywordFilter() {
    override val profiles = listOf("uvp")

    override val id = "KeywordFilterUvp"
    override val label = "<group label will be used>"

    override val parameters: List<String> = emptyList()

    override val filter = ""

    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?): String {
        val titleCondition = parameter?.joinToString(" OR ") { "title ILIKE '%$it%'" }
        val descriptionCondition = parameter?.joinToString(" OR ") { "data ->> 'description' ILIKE '%$it%'" }

        return """
            ($titleCondition)
            OR ($descriptionCondition)
        """
    }
}