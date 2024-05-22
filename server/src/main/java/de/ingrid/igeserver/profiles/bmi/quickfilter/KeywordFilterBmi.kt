/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
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