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
package de.ingrid.igeserver.profiles.bmi.exporter

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.model.AddressRefModel
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.bmi.exporter.model.AddressModel
import de.ingrid.igeserver.profiles.bmi.exporter.model.BmiModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.apache.logging.log4j.kotlin.logger
import java.text.SimpleDateFormat
import java.time.OffsetDateTime
import java.util.Date

val log = logger("BmiModelTransformer")

class TransformerCache {
    val documents = mutableMapOf<String, Document>()
}

data class TransformerConfig(
    val model: BmiModel,
    val catalogIdentifier: String,
    val codelists: CodelistTransformer,
    val config: Config,
    val catalogService: CatalogService,
    val cache: TransformerCache,
    val doc: Document,
    val documentService: DocumentService,
    val tags: List<String>,
)

open class BmiModelTransformer(
    transformerConfig: TransformerConfig,
) {
    val model = transformerConfig.model
    val catalogIdentifier = transformerConfig.catalogIdentifier
    val codelists = transformerConfig.codelists
    val config = transformerConfig.config
    val catalogService = transformerConfig.catalogService
    val cache = transformerConfig.cache
    val doc = transformerConfig.doc
    val documentService = transformerConfig.documentService
    val tags = transformerConfig.tags

    var catalog: Catalog

    val data = model.data

    var addresses: List<AddressModel> = emptyList()
    var themes: List<String> = emptyList()

    fun formatDate(formatter: SimpleDateFormat, date: OffsetDateTime?): String =
        if (date == null) "" else formatter.format(Date.from(date.toInstant()))

    init {
        this.catalog = catalogService.getCatalogById(catalogIdentifier)

        addresses = data.addresses?.map { toAddressModel(it) } ?: emptyList()
        themes = data.DCATThemes?.map { toCodelistData("6400", it) }?.filterNotNull() ?: emptyList()
    }

    private fun toCodelistData(codelist: String, entry: KeyValue): String? = codelists.getData(codelist, entry.key)

    private fun toAddressModel(it: AddressRefModel) =
        jacksonObjectMapper().convertValue(
            (
                getLastPublishedDocument(it.ref ?: throw ServerException.withReason("Address-Reference UUID is NULL")) ?: Document().apply {
                    data = jacksonObjectMapper().createObjectNode()
                    type = "null-address"
                    modified = OffsetDateTime.now()
                    wrapperId = -1
                }
                ).data,
            AddressModel::class.java,
        ).apply { type = it.type?.key }

    private fun getLastPublishedDocument(uuid: String): Document? {
        if (cache.documents.containsKey(uuid)) return cache.documents[uuid]
        return try {
            documentService.getLastPublishedDocument(catalogIdentifier, uuid, forExport = true)
                .also { cache.documents[uuid] = it }
        } catch (e: Exception) {
            log.warn("Could not get last published document: $uuid")
            null
        }
    }
}
