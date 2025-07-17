/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.features.ogc_api_records.services.formatFactory

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.features.ogc_api_records.model.Link
import de.ingrid.igeserver.features.ogc_api_records.services.OgcHtmlConverterService
import de.ingrid.igeserver.features.ogc_api_records.services.QueryMetadata
import de.ingrid.igeserver.services.ExportResult
import org.keycloak.util.JsonSerialization
import org.springframework.stereotype.Service

@Service
class HtmlFormater(
    private val ogcHtmlConverterService: OgcHtmlConverterService,
) : BodyFormater {

    override fun formatBeforeImport(collectionId: String, data: String, publish: Boolean): String = throw NotImplementedError("Import of records in format HTML is not implemented.")

    override fun basic(content: Any, title: String?): ByteArray {
        val infoAsObjectNode: ObjectNode = JsonSerialization.mapper.valueToTree(content)
        val html = ogcHtmlConverterService.convertObjectNode2Html(infoAsObjectNode, title)
        return ogcHtmlConverterService.wrapperForHtml(html, null, null).toByteArray()
    }

    override fun collections(collections: List<Any>, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        var response = ""
        for (catalog in collections) response += catalog.toString()

        val wrappedResponse = ogcHtmlConverterService.wrapperForHtml(response as String, links, queryMetadata)
        return wrappedResponse.toByteArray()
    }

    override fun records(records: List<ExportResult>, useDraft: Boolean, isSingleRecord: Boolean, links: List<Link>?, queryMetadata: QueryMetadata?): ByteArray {
        var response = ""
        for (record in records) response += record.result?.toString(Charsets.UTF_8)

        val wrappedResponse = ogcHtmlConverterService.wrapperForHtml(response, null, null)
        return wrappedResponse.toByteArray()
    }

    override val typeInfo: FormaterTypeInfo
        get() = FormaterTypeInfo(
            "html",
            "HTML Format",
            mimeTypes = listOf("text/html"),
            exportType = "html",
        )
}
