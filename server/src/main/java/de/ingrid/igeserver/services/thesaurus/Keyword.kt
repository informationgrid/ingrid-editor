/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services.thesaurus

data class Keyword(
    val id: String,
    val label: String,
    val alternativeLabel: String? = null
) {
    // two keywords are equal when "id" and "label" are equal
    override fun equals(other: Any?): Boolean {
        if (other !is Keyword) return false
        return KeywordEssential(this) == KeywordEssential(other)
    }

    override fun hashCode() = KeywordEssential(this.id, this.label).hashCode()
}

private data class KeywordEssential(
    val id: String,
    val label: String
) {
    constructor(keyword: Keyword) : this(keyword.id, keyword.label)
}

data class ThesaurusSearchOptions(
    val searchType: ThesaurusSearchType
)

enum class ThesaurusSearchType {
    EXACT, BEGINS_WITH, ENDS_WITH, CONTAINS
}
