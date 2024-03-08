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
package de.ingrid.igeserver.profiles.ingrid_bast.extensions

import de.ingrid.igeserver.profiles.ingrid.extensions.InGridPublishExport
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.context.annotation.Profile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
@Profile("elasticsearch")
class InGridBastPublishExport(
    docWrapperRepo: DocumentWrapperRepository,
    jdbcTemplate: JdbcTemplate,
    indexingTask: IndexingTask
) : InGridPublishExport(docWrapperRepo, jdbcTemplate, indexingTask) {

    override val profiles = arrayOf("ingrid-bast")

}
