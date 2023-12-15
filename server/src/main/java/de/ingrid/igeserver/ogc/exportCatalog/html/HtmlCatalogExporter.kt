/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.ogc.exportCatalog.html


import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.ogc.OgcHtmlConverterService
import de.ingrid.igeserver.ogc.exportCatalog.CatalogExportTypeInfo
import de.ingrid.igeserver.ogc.exportCatalog.OgcCatalogExporter
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import org.keycloak.util.JsonSerialization.mapper
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Lazy
import org.springframework.context.annotation.Profile
import org.springframework.http.MediaType
import org.springframework.stereotype.Service


@Service
@Profile("ogc-api")
class HtmlCatalogExporter(
        @Lazy val documentService: DocumentService,
        val catalogService: CatalogService,
        val ogcHtmlConverterService: OgcHtmlConverterService
) : OgcCatalogExporter {

    override val typeInfo: CatalogExportTypeInfo
        get() = CatalogExportTypeInfo(
                DocumentCategory.DATA,
                "html",
                "IGE Catalog in HTML",
                "HTML Representation des IGE Catalog",
                MediaType.TEXT_HTML_VALUE,
                "html",
                listOf()
        )

    override fun run(catalog: Catalog): Any {
        val objectNode: ObjectNode = mapper.valueToTree(catalog)
        return ogcHtmlConverterService.convertObjectNode2Html(objectNode, "Collection" )
    }

}