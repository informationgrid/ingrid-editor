/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exceptions.IndexException
import de.ingrid.igeserver.exporter.AddressModelTransformer
import de.ingrid.igeserver.exporter.AddressTransformerConfig
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.exporter.FolderModelTransformer
import de.ingrid.igeserver.exporter.model.FolderModel
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.output.JsonStringOutput
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter.IngridDocType
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.*
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.UploadConfig
import gg.jte.ContentType
import gg.jte.TemplateEngine
import gg.jte.TemplateOutput
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import tools.jackson.databind.ObjectMapper
import tools.jackson.module.kotlin.jacksonObjectMapper

@Service
class IngridLuceneExporter(
    val codelistHandler: CodelistHandler,
    val uploadConfig: UploadConfig,
    val catalogService: CatalogService,
    @Lazy val documentService: DocumentService,
) {
    val templateEngine: TemplateEngine = TemplateEngine.createPrecompiled(ContentType.Plain)
    val objectMapper: ObjectMapper = jacksonObjectMapper()

    fun run(doc: Document, catalogId: String, options: ExportOptions): Any {
        handleFoldersWithoutPublishedChildren(doc)
        val catalog = catalogService.getCatalogById(catalogId)
        val templateData = getTemplateForDoctype(doc, catalog, options)
        if (templateData.first == "export/ingrid/lucene/template-lucene.jte") {
            @Suppress("UNCHECKED_CAST")
            val map = templateData.second["map"] as Map<String, Any>
            val transformer = map["model"] as IngridModelTransformer
            val partner = map["partner"] as String
            val provider = map["provider"] as String
            val luceneDoc = transformer.toLuceneDocument(catalog, partner, provider)
            return objectMapper.writeValueAsString(luceneDoc)
        }
        val output: TemplateOutput = JsonStringOutput()
        templateEngine.render(templateData.first, templateData.second, output)
        return output.toString()
    }

    private fun handleFoldersWithoutPublishedChildren(doc: Document) {
        if (doc.type == "FOLDER") {
            val children = documentService.docWrapperRepo.findByParentIdAndPublished(doc.wrapperId!!)
            if (children.isEmpty()) throw IndexException.folderWithNoPublishedDocs(doc.uuid)
        }
    }

    fun getTemplateForDoctype(doc: Document, catalog: Catalog, options: ExportOptions): Pair<String, Map<String, Any>> = when (doc.type) {
        "InGridSpecialisedTask" -> Pair(
            "export/ingrid/lucene/template-lucene.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        "InGridGeoDataset" -> Pair(
            "export/ingrid/lucene/template-lucene.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        "InGridPublication" -> Pair(
            "export/ingrid/lucene/template-lucene.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        "InGridGeoService" -> Pair(
            "export/ingrid/lucene/template-lucene.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        "InGridProject" -> Pair(
            "export/ingrid/lucene/template-lucene.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        "InGridDataCollection" -> Pair(
            "export/ingrid/lucene/template-lucene.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        "InGridInformationSystem" -> Pair(
            "export/ingrid/lucene/template-lucene.jte",
            getMapper(IngridDocType.DOCUMENT, doc, catalog, options),
        )

        "InGridOrganisationDoc" -> Pair(
            "export/ingrid/lucene/template-lucene-address.jte",
            getMapper(IngridDocType.ADDRESS, doc, catalog, options),
        )

        "InGridPersonDoc" -> Pair(
            "export/ingrid/lucene/template-lucene-address.jte",
            getMapper(IngridDocType.ADDRESS, doc, catalog, options),
        )

        "FOLDER" -> Pair(
            "export/ingrid/lucene/template-lucene-folder.jte",
            getMapper(IngridDocType.FOLDER, doc, catalog, options),
        )

        else -> {
            throw ServerException.withReason("Cannot get template for type: ${doc.type}")
        }
    }

    fun getMapper(type: IngridDocType, doc: Document, catalog: Catalog, options: ExportOptions): Map<String, Any> {
        val codelistTransformer = CodelistTransformer(codelistHandler, catalog.identifier, catalog.settings.config.language ?: "de")
        val data = TransformerData(type, catalog.identifier, codelistTransformer, doc, options.tags)

        val transformer: Any = getTransformer(data)

        return mapOf(
            "map" to mapOf(
                "model" to transformer,
                "catalog" to catalog,
                "partner" to mapCodelistValue("110", catalog.settings.config.partner),
                "provider" to mapCodelistValue("111", catalog.settings.config.provider),
            ),
        )
    }

    fun getTransformer(data: TransformerData): Any = when (data.type) {
        IngridDocType.ADDRESS -> {
            AddressModelTransformer(
                AddressTransformerConfig(
                    data.catalogIdentifier,
                    data.codelistTransformer,
                    null,
                    data.doc,
                    documentService = documentService,
                    uploadConfig = uploadConfig,
                    data.tags,
                ),
            )
        }

        IngridDocType.DOCUMENT -> {
            IngridModelTransformer(
                TransformerConfig(
                    data.mapper.convertValue(data.doc, IngridModel::class.java),
                    data.catalogIdentifier,
                    data.codelistTransformer,
                    uploadConfig,
                    catalogService,
                    TransformerCache(),
                    data.doc,
                    documentService,
                    data.tags,
                ),
            )
        }

        IngridDocType.FOLDER -> {
            FolderModelTransformer(
                data.mapper.convertValue(data.doc, FolderModel::class.java),
                data.catalogIdentifier,
                data.codelistTransformer,
            )
        }
    }

    private fun mapCodelistValue(codelistId: String, partner: String?): String = partner?.let { codelistHandler.getCodelistValue(codelistId, it, "ident") } ?: ""

    enum class IngridDocType {
        ADDRESS,
        DOCUMENT,
        FOLDER,
    }
}

data class TransformerData(
    val type: IngridDocType,
    val catalogIdentifier: String,
    val codelistTransformer: CodelistTransformer,
    val doc: Document,
    val tags: List<String>,
    val mapper: ObjectMapper = jacksonObjectMapper(),
)

fun IngridModelTransformer.toLuceneDocument(
    catalog: Catalog,
    partner: String,
    provider: String,
): LuceneDocument = LuceneDocument(
    id = model.uuid,
    schema = "https://schema.ingrid-oss.eu/index/draft/index-ingrid.html",
    metadata = LuceneMetadata(
        dataType = "INGRID",
        created = formatDate(formatterISO, model._created),
        modified = formatDate(formatterISO, model._contentModified),
        issued = null,
        partner = partner,
        provider = provider,
        language = metadataLanguage,
        datasource = LuceneDatasource(
            id = catalog.identifier,
            name = catalog.name,
        ),
    ),
    title = model.title,
    description = data.description,
    spatials = getSpatials().map { entry ->
        LuceneSpatial(
            name = entry.title,
            bbox = entry.bbox?.let { listOf(it.lon1, it.lat1, it.lon2, it.lat2) },
            wkt = entry.wkt,
            toponym = entry.toponym?.let { listOf(it) },
            administrative = entry.administrativeArea?.let { LuceneAdministrative(it) },
            geometry = entry.geoJson,
        )
    },
    temporal = LuceneTemporal(
        dataTemporal = getTemporal().map { entry ->
            LuceneDataTemporal(
                dateType = entry.type.type,
                date = entry.date?.let { formatDate(formatterUTC, it) },
                dateText = entry.dateText,
                dateRange = entry.dateRange?.let { range ->
                    LuceneDateRange(
                        start = range.start?.let { formatDate(formatterUTC, it) },
                        end = range.end?.let { formatDate(formatterUTC, it) },
                    )
                },
            )
        },
        status = data.temporal.status?.let { LuceneKeyValue(it.key, it.value) },
        maintenanceFrequency = data.maintenanceInformation?.maintenanceAndUpdateFrequency?.let { LuceneKeyValue(it.key, it.value) },
        userDefinedMaintenanceFrequencyInSec = data.maintenanceInformation?.userDefinedMaintenanceFrequency?.number?.toString(),
    ),
    keywords = getAllKeywords().flatMap { category ->
        category.keywords.map { keyword ->
            LuceneKeyword(
                term = keyword.label,
                id = keyword.id,
                source = category.type,
            )
        }
    },
    sortUuid = "",
    contacts = contacts.map { contact ->
        LuceneContact(
            role = contact.relationType?.value,
            name = contact.title,
            communications = contact.allCommunications.map {
                LuceneCommunication(type = it.key, value = it.value)
            },
            street = contact.street,
            code = contact.zipCode,
            pocode = contact.zipPoBox,
            locality = contact.city,
            country = contact.countryIso3166,
            administrativeArea = contact.administrativeArea,
        )
    },
    exports = emptyMap(),
    ingrid = LuceneIngrid(
        alternateTitle = alternateTitle,
        references = getAllReferences().map { ref ->
            LuceneReference(
                internal = "url" != ref.referenceType,
                url = ref.url,
                uuidRef = ref.uuidRef,
                type = LuceneKeyValue(ref.type.key, ref.type.value),
                title = ref.title,
                explanation = ref.explanation,
            )
        },
        licenses = getAllLicenses().map { lic ->
            LuceneLicense(
                type = lic.type,
                items = lic.items.map { item ->
                    LuceneLicenseItem(
                        key = item.key,
                        value = item.value,
                        source = item.source,
                    )
                },
            )
        },
        parentIdentifier = getParentIdentifier(),
        datasourceIdentifier = resourceIdentifier,
        spatialRepresentation = emptyList(),
        specificUsage = specificUsage,
        purpose = purpose,
        conformanceResult = data.conformanceResult?.map { conf ->
            LuceneConformanceResult(
                pass = getConformancePass(conf),
                specification = conf.specification?.let { LuceneKeyValue(it.key, it.value) },
                publicationDate = conf.publicationDate,
                explanation = conf.explanation,
            )
        } ?: emptyList(),
        orderInfo = data.orderInfo,
        dataQuality = emptyMap(),
    ),
)
