/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_bmwk.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.getStringOrEmpty

/*
class BMWKModelTransformer(val doc: Document, val codelistHandler: CodelistHandler, val catalogId: String): IngridModelTransformer(model,
    catalogId,
    codelistHandler,
    config,
    catalogService,
    cache,
    doc,
    documentService) {
    fun getDistributions(): List<Distribution> {
        return doc.data.get("distributions")?.map { dist ->
            Distribution(
                dist.getStringOrEmpty("format.key"),
                dist.getStringOrEmpty("link.uri"),
                dist.getStringOrEmpty("modified"),
                dist.getStringOrEmpty("title"),
                dist.getStringOrEmpty("description"),
                mapLicense(dist.getString("license.key")),
                dist.getStringOrEmpty("byClause"),
                dist.get("languages").mapNotNull { mapLanguage(it) },
                mapAvailability(dist.getStringOrEmpty("availability.key"))
            )
        } ?: emptyList()
    }

    private fun mapAvailability(key: String?): String {
        if (key == null) return ""
        return codelistHandler.getCatalogCodelistValue(catalogId, "20005", key) ?: ""
    }

    private fun mapLicense(licenseKey: String?): License? {
        if (licenseKey.isNullOrEmpty()) return null
        val value = codelistHandler.getCatalogCodelistValue(catalogId, "20004", licenseKey)
        return License(licenseKey, value!!)
    }

    private fun mapLanguage(it: JsonNode): String? {
        return codelistHandler.getCatalogCodelistValue(catalogId, "20007", it.getString("key")!!)
    }
}*/
