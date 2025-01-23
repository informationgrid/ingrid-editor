/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_baw.types

import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoDatasetType
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoServiceType
import de.ingrid.igeserver.profiles.ingrid_baw.BawProfile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

private const val PROFILE_ID = BawProfile.ID

@Component
class InGridGeoDatasetTypeBaw(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/baw/geo-dataset_baw.schema.json"
    override val profiles = arrayOf(PROFILE_ID)
}

@Component
class InGridGeoServiceTypeBaw(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
//    override val jsonSchema = "/ingrid/schemes/baw/geo-service_baw.schema.json"
    override val profiles = arrayOf(PROFILE_ID)
}
