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
package de.ingrid.igeserver.profiles.ingrid_bast.exporter.internal

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.convertStringToDocument
import de.ingrid.igeserver.profiles.ingrid.exporter.transformIDFtoIso
import de.ingrid.igeserver.profiles.ingrid_bast.exporter.IngridExporterBast
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.xml.XMLUtils
import org.springframework.stereotype.Service

@Service
class IngridISOExporterBast(
    idfExporter: IngridIdfExporterBast,
    luceneExporter: IngridLuceneExporterBast,
    documentWrapperRepository: DocumentWrapperRepository
) : IngridExporterBast(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOBast",
        "ISO 19139 Bast",
        "Export von Bast Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-bast")
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val indexString = super.run(doc, catalogId, options) as String
        val elasticDoc = jacksonObjectMapper().readValue<ElasticDocument>(indexString)
        val idfDoc = convertStringToDocument(elasticDoc["idf"] as String)
        val isoDoc = transformIDFtoIso(idfDoc!!)
        return XMLUtils.toString(isoDoc)
    }

}
