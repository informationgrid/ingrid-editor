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
package de.ingrid.igeserver.profiles.ingrid_wsv.exporter

import com.fasterxml.jackson.databind.node.ArrayNode
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.beans.factory.annotation.Qualifier
import org.springframework.beans.factory.annotation.Value
import org.springframework.stereotype.Service

@Service
class IngridExporterCswWsv(
    @Qualifier("ingridIDFExporter") idfExporter: IngridIDFExporter,
    @Qualifier("ingridLuceneExporter") luceneExporter: IngridLuceneExporter,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFCswWsv",
            "WSV CSW Export (ohne interne Pfade)",
            "Export von Ingrid Dokumenten ins IDF Format für WSV für CSW-Export.",
            "application/json",
            "json",
            listOf("ingrid-wsv"),
            isPublic = true,
            useForPublish = true
        )

    @Value("\${wsv.cart.types:10900,10901,10902,10903,10904}")
    private val SPECIAL_TYPE : List<String> = emptyList()
    override fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        if(doc.data?.get("references") !== null) {
            (doc.data.get("references") as ArrayNode).removeAll { ref ->  SPECIAL_TYPE.contains(ref.get("type")?.get("key")?.textValue())}
        }

        return super.run(doc, catalogId, options)
    }
}
