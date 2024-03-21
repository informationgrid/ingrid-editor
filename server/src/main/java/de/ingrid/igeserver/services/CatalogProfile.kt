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
package de.ingrid.igeserver.services

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.api.messaging.Message
import de.ingrid.igeserver.imports.OptimizedImportAnalysis
import de.ingrid.igeserver.model.FacetGroup
import org.springframework.security.core.Authentication

interface CatalogProfile {
    @get:JsonProperty("id")
    val identifier: String
    val title: String
    val description: String?
    val indexExportFormatID: String
    val parentProfile: String?
        get() = null

    @get:JsonIgnore
    val indexIdField: IndexIdFieldConfig

    @JsonIgnore
    fun getFacetDefinitionsForDocuments(): Array<FacetGroup>

    @JsonIgnore
    fun getFacetDefinitionsForAddresses(): Array<FacetGroup>

    @JsonIgnore
    fun initCatalogCodelists(catalogId: String, codelistId: String? = null)

    @JsonIgnore
    fun initCatalogQueries(catalogId: String)

    @JsonIgnore
    fun initIndices()

    @JsonIgnore
    fun getElasticsearchMapping(format: String): String

    @JsonIgnore
    fun getElasticsearchSetting(format: String): String

    @JsonIgnore
    fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String> {
        return permissions
    }

    @JsonIgnore
    fun additionalImportAnalysis(catalogId: String, report: OptimizedImportAnalysis, message: Message) {}

}

data class IndexIdFieldConfig(
    val document: String,
    val address: String
)
