package de.ingrid.igeserver.profiles.bmi.quickfilter

import de.ingrid.igeserver.model.KeywordFilter
import org.intellij.lang.annotations.Language
import org.springframework.stereotype.Component

@Component
class KeywordFilterBmi: KeywordFilter() {
    override val profiles = listOf("bmi")

    override val id = "KeywordFilterBmi"
    override val label = "<group label will be used>"

    override val parameters: List<String> = emptyList()

    override val filter = ""

    @Language("PostgreSQL")
    override fun filter(parameter: List<*>?): String {
        val titleCondition = parameter?.joinToString(" OR ") { "title ILIKE '%$it%'" }
        val descriptionCondition = parameter?.joinToString(" OR ") { "data ->> 'description' ILIKE '%$it%'" }
        val keywordsCondition = parameter?.joinToString(" OR ") { "data ->> 'keywords' ILIKE '%$it%'" }

        return """
            ($titleCondition) 
            OR ($descriptionCondition) 
            OR ($keywordsCondition)
        """
    }
}