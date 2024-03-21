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
package de.ingrid.igeserver

import de.ingrid.igeserver.model.FacetGroup
import de.ingrid.igeserver.services.CatalogProfile
import de.ingrid.igeserver.services.IndexIdFieldConfig
import org.springframework.stereotype.Service

@Service
class DummyCatalog : CatalogProfile {
    override var identifier = "DUMMY"
    override val title = "DUMMY Catalog"
    override val description = "This catalog is only used for test purpose"
    override val indexExportFormatID = ""
    override val indexIdField = IndexIdFieldConfig("t01_object.obj_id", "t02_address.adr_id")

    override fun getFacetDefinitionsForDocuments(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun getFacetDefinitionsForAddresses(): Array<FacetGroup> {
        TODO("Not yet implemented")
    }

    override fun initCatalogCodelists(catalogId: String, codelistId: String?) {
    }

    override fun initCatalogQueries(catalogId: String) {
        TODO("Not yet implemented")
    }

    override fun initIndices() {
        TODO("Not yet implemented")
    }

    override fun getElasticsearchMapping(format: String): String {
        TODO("Not yet implemented")
    }

    override fun getElasticsearchSetting(format: String): String {
        TODO("Not yet implemented")
    }
}