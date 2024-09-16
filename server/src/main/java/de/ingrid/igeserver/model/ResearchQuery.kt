/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.model

data class ResearchQuery(
    val term: String?,
    val clauses: BoolFilter?,
    val orderByField: String? = "title",
    val orderByDirection: String? = "ASC",
    val pagination: ResearchPaging = ResearchPaging(),
)

data class BoolFilter(
    val op: String,
    val value: List<String>?,
    val clauses: List<BoolFilter>?,
    val parameter: List<String?>?,
    val isFacet: Boolean = true,
)

data class ResearchPaging(
    val page: Int = 1,
    val pageSize: Int = Int.MAX_VALUE,
    val offset: Int = 0,
)
