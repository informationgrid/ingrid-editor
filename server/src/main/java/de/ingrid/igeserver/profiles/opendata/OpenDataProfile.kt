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

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ClientException
import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.model.Operator
import de.ingrid.igeserver.model.ViewComponent
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Codelist
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.CodelistRepository
import de.ingrid.igeserver.research.quickfilter.Draft
import de.ingrid.igeserver.research.quickfilter.ExceptFolders
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.CodelistHandler.Companion.toCodelistEntry
import de.ingrid.igeserver.services.IndexIdFieldConfig
import org.springframework.stereotype.Service

@Service
class OpenDataProfile(
    @JsonIgnore val codelistRepo: CodelistRepository,
    @JsonIgnore val catalogRepo: CatalogRepository,
    @JsonIgnore val codelistHandler: CodelistHandler
) : CatalogProfile {

    companion object {
        const val id = "opendata"
    }

    override val identifier = id
    override val title = "Open-Data Katalog"
    override val description: String? = null

    override val indexExportFormatID = "indexOpenDataIDF"

    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Filter", arrayOf(
                    Draft(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX,
                combine = Operator.AND
            )
        )
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        return arrayOf(
            FacetGroup(
                "state", "Filter", arrayOf(
                    Draft(),
                    ExceptFolders()
                ),
                viewComponent = ViewComponent.CHECKBOX
            )
        )
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
        val catalogRef = catalogRepo.findByIdentifier(catalogId)

        val codelist20003 = Codelist().apply {
            identifier = "20003"
            catalog = catalogRef
            name = "Download Format"
            description = "Dies sind die Formate, die ein Download-Eintrag haben kann"
            data = jacksonObjectMapper().createArrayNode().apply {
                codelist20003.forEach {
                    add(toCodelistEntry(it, it))
                }
            }
        }
        val codelist20004 = Codelist().apply {
            identifier = "20004"
            catalog = catalogRef
            name = "Lizenzen"
            description = "Liste der Lizenzen die von GovData unterstützt werden."
            data = jacksonObjectMapper().createArrayNode().apply {
                codelist20004.forEach { (key, value) ->
                    add(toCodelistEntry(key, value))
                }
            }
        }
        val codelist20005 = Codelist().apply {
            identifier = "20005"
            catalog = catalogRef
            name = "geplante Verfügbarkeiten"
            description = "Liste der geplanten Verfügbarkeiten die von GovData unterstützt werden."
            data = jacksonObjectMapper().createArrayNode().apply {
                codelist20005.forEach { (key, value) ->
                    add(toCodelistEntry(key, value))
                }
            }
        }
        val codelist20006 = Codelist().apply {
            identifier = "20006"
            catalog = catalogRef
            name = "geopolitischen Verwaltungscodierung"
            description = "Liste der geopolitischen Verwaltungscodierung"
            data = jacksonObjectMapper().createArrayNode().apply {
                codelist20006.forEach { (key, value) ->
                    add(toCodelistEntry(key, value))
                }
            }
        }
        val codelist20007 = Codelist().apply {
            identifier = "20007"
            catalog = catalogRef
            name = "Sprache"
            description = "Liste der Sprachen"
            data = jacksonObjectMapper().createArrayNode().apply {
                codelist20007.forEach { (key, value) ->
                    add(toCodelistEntry(key, value))
                }
            }
        }

        when (codelistId) {
//            "505" -> codelistHandler.removeAndAddCodelist(catalogId, codelist505)
//            "20001" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20001)
            // "20002" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20002) // Deprecated Liste "Download Typ"
            "20003" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20003)
            "20004" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20004)
            "20005" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20005)
            "20006" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20006)
            "20007" -> codelistHandler.removeAndAddCodelist(catalogId, codelist20007)
            null -> {
//                codelistHandler.removeAndAddCodelist(catalogId, codelist505)
//                codelistRepo.save(codelist505)
//                codelistHandler.removeAndAddCodelist(catalogId, codelist20001)
//                codelistRepo.save(codelist20001)
                codelistHandler.removeAndAddCodelist(catalogId, codelist20003)
                codelistRepo.save(codelist20003)
                codelistHandler.removeAndAddCodelist(catalogId, codelist20004)
                codelistRepo.save(codelist20004)
                codelistHandler.removeAndAddCodelist(catalogId, codelist20005)
                codelistRepo.save(codelist20005)
                codelistHandler.removeAndAddCodelist(catalogId, codelist20006)
                codelistRepo.save(codelist20006)
                codelistHandler.removeAndAddCodelist(catalogId, codelist20007)
                codelistRepo.save(codelist20007)
            }

            else -> throw ClientException.withReason("Codelist $codelistId is not supported by this profile: $identifier")
        }
    }

    override fun initCatalogQueries(catalogId: String) {

    }

    override fun initIndices() {

    }

    override fun getElasticsearchMapping(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-mapping.json")?.readText() ?: ""
    }

    override fun getElasticsearchSetting(format: String): String {
        return {}.javaClass.getResource("/ingrid/default-settings.json")?.readText() ?: ""
    }

}