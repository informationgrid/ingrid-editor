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
package de.ingrid.igeserver.profiles.ingrid_bkg.types

import de.ingrid.igeserver.profiles.ingrid.types.InGridDataCollectionType
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoDatasetType
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoServiceType
import de.ingrid.igeserver.profiles.ingrid.types.InGridInformationSystemType
import de.ingrid.igeserver.profiles.ingrid.types.InGridProjectType
import de.ingrid.igeserver.profiles.ingrid.types.InGridPublicationType
import de.ingrid.igeserver.profiles.ingrid_bkg.BkgProfile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

private const val PROFILE_ID = BkgProfile.ID

@Component
class InGridGeoDatasetTypeBkg(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val profiles = arrayOf(PROFILE_ID)
    override val jsonSchema = "/ingrid/schemes/bkg/geo-dataset_bkg.schema.json"
}

@Component
class InGridGeoServiceTypeBkg(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/bkg/geo-service_bkg.schema.json"
    override val profiles = arrayOf(PROFILE_ID)
}

@Component
class InGridDataCollectionTypeBkg(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/bkg/data-collection_bkg.schema.json"
    override val profiles = arrayOf(PROFILE_ID)
}

@Component
class InGridInformationSystemTypeBkg(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/bkg/information-system_bkg.schema.json"
    override val profiles = arrayOf(PROFILE_ID)
}

@Component
class InGridPublicationTypeBkg(jdbcTemplate: JdbcTemplate) : InGridPublicationType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/bkg/publication_bkg.schema.json"
    override val profiles = arrayOf(PROFILE_ID)
}

@Component
class InGridProjectTypeBkg(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/bkg/project_bkg.schema.json"
    override val profiles = arrayOf(PROFILE_ID)
}
