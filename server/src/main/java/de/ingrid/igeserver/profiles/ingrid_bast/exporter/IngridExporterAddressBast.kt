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
package de.ingrid.igeserver.profiles.ingrid_bast.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.stereotype.Service

@Service
class IngridExporterAddressBast(
    idfExporter: IngridIdfExporterBast,
    luceneExporter: IngridLuceneExporterBast,
    documentWrapperRepository: DocumentWrapperRepository
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.ADDRESS,
            "indexInGridIDFBast",
            "Ingrid IDF Address BASt (Elasticsearch)",
            "Export von Ingrid Adressen ins IDF Format für BASt für die Anzeige im Portal ins Elasticsearch-Format.",
            "application/json",
            "json",
            listOf("ingrid-bast"),
            false
        )
}
