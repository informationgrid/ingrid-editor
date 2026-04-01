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
package de.ingrid.igeserver.persistence.model.document

/**
 * Filter for the document state
 */
enum class DocStateFilter {
    LATEST,
    ONLY_PUBLISHED,
    PENDING_OR_PUBLISHED,
    ALL_STATES,
    ;

    fun toSql(): String = when (this) {
        ONLY_PUBLISHED -> "document1.state = 'PUBLISHED'"
        PENDING_OR_PUBLISHED -> "document1.state = 'PENDING' OR document1.state = 'PUBLISHED'"
        ALL_STATES -> "document1.state = 'DRAFT' OR document1.state = 'DRAFT_AND_PUBLISHED' OR document1.state = 'PENDING' OR document1.state = 'PUBLISHED'"
        LATEST -> "document1.is_latest = true"
    }
}
