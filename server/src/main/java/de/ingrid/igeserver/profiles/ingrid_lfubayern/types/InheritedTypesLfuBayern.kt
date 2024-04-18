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
package de.ingrid.igeserver.profiles.ingrid_lfubayern.types

import de.ingrid.igeserver.profiles.ingrid.types.*
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridOrganisationType
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridPersonType
import de.ingrid.igeserver.profiles.ingrid_lfubayern.LfuBayernProfile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
    override val jsonSchema = "/ingrid/schemes/lfubayern/geo-dataset_lfubayern.schema.json"
}

@Component
class InGridDataCollectionTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
}

@Component
class InGridGeoServiceTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
    override val jsonSchema = "/ingrid/schemes/lfubayern/geo-service_lfubayern.schema.json"
}

@Component
class InGridInformationSystemTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
    override val jsonSchema = "/ingrid/schemes/lfubayern/information-system_lfubayern.schema.json"
}

@Component
class InGridPublicationTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridPublicationType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
}

@Component
class InGridProjectTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
}

@Component
class InGridSpecialisedTaskTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
}

@Component
class InGridOrganisationTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridOrganisationType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
}

@Component
class InGridPersonTypeLfuBayern(jdbcTemplate: JdbcTemplate) : InGridPersonType(jdbcTemplate) {
    override val profiles = arrayOf(LfuBayernProfile.id)
}