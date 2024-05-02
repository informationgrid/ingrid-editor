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
package de.ingrid.igeserver.profiles.opendata.types

import de.ingrid.igeserver.profiles.bmi.types.BmiAddressType
import de.ingrid.igeserver.profiles.bmi.types.BmiType
import de.ingrid.igeserver.profiles.opendata.OpenDataProfile
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class OpenDataDatasetTypeOpenData(jdbcTemplate: JdbcTemplate) : BmiType() {
    override val profiles = arrayOf(OpenDataProfile.id)
//    override val jsonSchema = "/ingrid/schemes/bast/geo-dataset_bast.schema.json"
}

@Component
class OpenDataAddressTypeOpenData(jdbcTemplate: JdbcTemplate) : BmiAddressType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
//    override val jsonSchema = "/ingrid/schemes/bast/geo-dataset_bast.schema.json"
}
/*

@Component
class InGridGeoDatasetTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
//    override val jsonSchema = "/ingrid/schemes/bast/geo-dataset_bast.schema.json"
}

@Component
class InGridDataCollectionTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
}

@Component
class InGridGeoServiceTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
//    override val jsonSchema = "/ingrid/schemes/bast/geo-service_bast.schema.json"
}

@Component
class InGridInformationSystemTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
}

@Component
class InGridPublicationTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridPublicationType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
}

@Component
class InGridProjectTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
}

@Component
class InGridSpecialisedTaskTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
}

@Component
class InGridOrganisationTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridOrganisationType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
}

@Component
class InGridPersonTypeOpenData(jdbcTemplate: JdbcTemplate) : InGridPersonType(jdbcTemplate) {
    override val profiles = arrayOf(OpenDataProfile.id)
}*/
