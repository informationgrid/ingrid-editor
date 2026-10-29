/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid.exporter

import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.stereotype.Service

/**
 * Like the [IngridIndexExporter], but the IDF document inside the exported JSON is
 * rendered by the [IngridIdfNoInspireLinksExporter], i.e. the inspire keywords are
 * exported without the INSPIRE links used by [IngridModelTransformer.mapToInspireLink].
 */
@Service
class IngridIndexNoInspireLinksExporter(
    @Qualifier("ingridISOExporter") override val isoExporter: IngridISOExporter,
    @Qualifier("ingridLuceneExporter") luceneExporter: IngridLuceneExporter,
) : IngridIndexExporter(isoExporter, luceneExporter) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "indexInGridIDFNoInspireLinks",
        "Export Portal (InGrid, ohne INSPIRE-Links)",
        "Export von Ingrid Dokumenten ins IDF Format für die Anzeige im Portal ins Elasticsearch-Format. INSPIRE-Keywords werden ohne die INSPIRE-Links exportiert.",
        "application/json",
        "json",
        listOf("ingrid"),
        isPublic = false,
        useForPublish = true,
    )
}
