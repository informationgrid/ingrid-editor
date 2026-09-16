/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import jakarta.validation.constraints.Pattern
import jakarta.validation.constraints.Positive

/**
 * Request data class for searching documents by title or UUID.
 * 
 * @property term The search term to match against document titles (case-insensitive) or UUIDs (exact match)
 * @property category The document category to filter by (must be "data" or "address")
 * @property excludeFolders If true, folders will be excluded from the search results
 * @property pageSize The maximum number of results to return (must be positive, default: 10)
 */
data class TitleOrUuidSearchRequest(
    val term: String,
    @field:Pattern(regexp = "data|address")
    val category: String = "data",
    val excludeFolders: Boolean = false,
    @field:Positive
    val pageSize: Int = 10,
)
