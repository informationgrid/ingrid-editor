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
package de.ingrid.igeserver.profiles.opendata

import de.ingrid.igeserver.profiles.bmi.BmiProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.stereotype.Service

@Service
class OpenDataProfile(
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    query: QueryRepository,
    dateService: DateService,
    codelistRepository: CodelistRepository,
    authUtils: AuthUtils
) : BmiProfile(codelistRepository, catalogRepo, codelistHandler, query, dateService, authUtils) {

    companion object {
        const val id = "opendata"
    }

    override val identifier = id
    override val title = "Open-Data Katalog"
    override val parentProfile = "bmi"

    override val indexExportFormatID = "indexOpenDataIDF"

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/opendata/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-settings.json")?.readText() ?: ""
    }

}