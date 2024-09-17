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
package de.ingrid.igeserver.profiles.bmi

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.profiles.opendata.OpenDataProfile
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.research.quickfilter.Draft
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.IndexIdFieldConfig
import de.ingrid.igeserver.services.Permissions
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.security.core.Authentication
import org.springframework.stereotype.Service

@Service
class BmiProfile(
    codelistRepo: CodelistRepository,
    catalogRepo: CatalogRepository,
    codelistHandler: CodelistHandler,
    @JsonIgnore val authUtils: AuthUtils,
) : OpenDataProfile(codelistRepo, catalogRepo, codelistHandler) {

    override val identifier = "bmi"
    override val title = "Open Data Katalog (Bund)"
    override val description = null
    override val indexExportFormatID = "index"
    override val indexIdField = IndexIdFieldConfig("uuid", "uuid")

    override val parentProfile = "opendata"

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> = arrayOf(
        FacetGroup(
            "state",
            "Filter",
            arrayOf(
                Draft(),
                ExceptFolders(),
            ),
            viewComponent = ViewComponent.CHECKBOX,
            combine = Operator.AND,
        ),
    )

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> = arrayOf(
        FacetGroup(
            "state",
            "Filter",
            arrayOf(
                Draft(),
                ExceptFolders(),
            ),
            viewComponent = ViewComponent.CHECKBOX,
        ),
    )

    override fun initCatalogQueries(catalogId: String) {
    }

    override fun initIndices() {
    }

    override fun getElasticsearchMapping(format: String): String = {}.javaClass.getResource("/bmi/default-mapping.json")?.readText() ?: ""

    override fun getElasticsearchSetting(format: String): String = {}.javaClass.getResource("/bmi/default-settings.json")?.readText() ?: ""

    private fun toISOCodelistEntry(id: String, german: String, iso: String): JsonNode = jacksonObjectMapper().createObjectNode().apply {
        put("id", id)
        set<JsonNode>(
            "localisations",
            jacksonObjectMapper().createObjectNode().apply {
                put("de", german)
                put("iso", iso)
            },
        )
    }

    override fun profileSpecificPermissions(permissions: List<String>, principal: Authentication): List<String> {
        val isSuperAdmin = authUtils.containsRole(principal, "ige-super-admin")
        val isCatAdmin = authUtils.containsRole(principal, "cat-admin")

        val newPermissions: MutableList<String> = permissions.toMutableList()

        if (isCatAdmin) {
            newPermissions.add(Permissions.manage_content.name)
        }

        return if (isSuperAdmin) {
            newPermissions
        } else {
            newPermissions.filter { permission ->
                (
                    !permission.equals(Permissions.can_import.name) &&
                        !permission.equals(Permissions.can_export.name) &&
                        !permission.equals(Permissions.manage_codelist_repository.name) &&
                        !permission.equals(Permissions.manage_ibus.name)
                    )
            }
        }
    }
}
