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
package de.ingrid.igeserver.profiles.ingrid_hmdk.types

import de.ingrid.igeserver.profiles.ingrid.types.InGridDataCollectionType
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoDatasetType
import de.ingrid.igeserver.profiles.ingrid.types.InGridGeoServiceType
import de.ingrid.igeserver.profiles.ingrid.types.InGridInformationSystemType
import de.ingrid.igeserver.profiles.ingrid.types.InGridProjectType
import de.ingrid.igeserver.profiles.ingrid.types.InGridPublicationType
import de.ingrid.igeserver.profiles.ingrid.types.InGridSpecialisedTaskType
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridOrganisationType
import de.ingrid.igeserver.profiles.ingrid.types.address.InGridPersonType
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class InGridGeoDatasetTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridGeoDatasetType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/hmdk/geo-dataset_hmdk.schema.json"
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridGeoServiceTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridGeoServiceType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/hmdk/geo-service_hmdk.schema.json"
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridDataCollectionTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridDataCollectionType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/hmdk/data-collection_hmdk.schema.json"
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridInformationSystemTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridInformationSystemType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/hmdk/information-system_hmdk.schema.json"
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridPublicationTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridPublicationType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/hmdk/publication_hmdk.schema.json"
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridProjectTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridProjectType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/hmdk/project_hmdk.schema.json"
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridSpecialisedTaskTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridSpecialisedTaskType(jdbcTemplate) {
    override val jsonSchema = "/ingrid/schemes/hmdk/specialised-task_hmdk.schema.json"
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridOrganisationTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridOrganisationType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-hmdk")
}

@Component
class InGridPersonTypeHmdk(jdbcTemplate: JdbcTemplate) : InGridPersonType(jdbcTemplate) {
    override val profiles = arrayOf("ingrid-hmdk")
}
