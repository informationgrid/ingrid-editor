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
package de.ingrid.igeserver.profiles.ingrid_lfubayern.exporter

import de.ingrid.igeserver.exporter.model.Address
import de.ingrid.igeserver.exporter.model.AddressModel
import de.ingrid.igeserver.exports.ExportOptions
import de.ingrid.igeserver.exports.ExportTypeInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIDFExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridIndexExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridLuceneExporter
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerData
import de.ingrid.igeserver.profiles.ingrid.exporter.model.DataModel
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.profiles.ingrid.getISOFromElasticDocumentString
import de.ingrid.igeserver.profiles.uvp.exporter.model.DataModel.Companion.behaviourService
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.Config
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

@Service
class IngridExporterExternalLfub(
    idfExporter: IngridIdfExporterExternalLfub,
    luceneExporter: IngridLuceneExporterExternalLfub,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIndexExporter(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo =
        ExportTypeInfo(
            DocumentCategory.DATA,
            "indexInGridIDFLfuExternalBayern",
            "Ingrid IDF LfuBayern External (Elasticsearch)",
            "Export von Ingrid Dokumenten ins IDF Format für LfuBayern für die Anzeige im externen Portal ins Elasticsearch-Format.",
            "application/json",
            "json",
            listOf("ingrid-lfubayern"),
            isPublic = false,
            useForPublish = true,
        )
}

@Service
class IngridIdfExporterExternalLfub(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService) {

    override fun getModelTransformerClass(docType: String): KClass<out Any>? =
        getLfuBayernExternalTransformer(docType) ?: super.getModelTransformerClass(docType)

    override fun getIngridModel(doc: Document, catalogId: String): IngridModel {
        val uuid = getUuidAnonymous(catalogId)
        return mapper.convertValue(doc, IngridModel::class.java).apply {
            anonymizeAddresses(this, uuid)
            removeOfflineAccessReferences(this.data)
        }
    }
}

@Service
class IngridLuceneExporterExternalLfub(
    codelistHandler: CodelistHandler,
    config: Config,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
) : IngridLuceneExporter(
    codelistHandler,
    config,
    catalogService,
    documentService,
) {

    override fun getTransformer(data: TransformerData): Any {
        val uuidAnonymous: String = getUuidAnonymous(data.catalogIdentifier)
        return when (data.type) {
            IngridDocType.DOCUMENT -> {
                val model = data.mapper.convertValue(data.doc, IngridModel::class.java)
                anonymizeAddresses(model, uuidAnonymous)
                removeOfflineAccessReferences(model.data)

                getLfuBayernExternalTransformer(data.doc.type)
                    ?.constructors
                    ?.first()
                    ?.call(
                        TransformerConfig(
                            model,
                            data.catalogIdentifier,
                            data.codelistTransformer,
                            config,
                            catalogService,
                            TransformerCache(),
                            data.doc,
                            documentService,
                            data.tags,
                        ),
                    ) ?: super.getTransformer(data)
            }

            else -> super.getTransformer(data)
        }
    }
}

@Service
class IngridISOExporterExternalLfub(
    idfExporter: IngridIdfExporterExternalLfub,
    luceneExporter: IngridLuceneExporterExternalLfub,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridExporterExternalLfub(idfExporter, luceneExporter, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridISOLfuExternalBayern",
        "ISO 19139 LfuBayern External",
        "Export von LfuBayern Dokumenten in ISO für die Vorschau im Editor.",
        "text/xml",
        "xml",
        listOf("ingrid-lfubayern"),
    )

    override fun run(doc: Document, catalogId: String, options: ExportOptions): String {
        val indexString = super.run(doc, catalogId, options) as String
        return getISOFromElasticDocumentString(indexString)
    }
}

private fun anonymizeAddresses(model: IngridModel, uuid: String) {
    val anonymousAddress = AddressModel(
        uuid, "InGridOrganisationDoc", null, null, null, null,
        null, null, emptyList(), null,
        Address(null, null, null, null, null, null, null), null, null,
    )
    model.data.pointOfContact?.forEach {
        it.ref = anonymousAddress.uuid
    }
}

private fun getUuidAnonymous(catalogId: String) =
    behaviourService?.get(catalogId, "plugin.lfubayern.anonymous.address")?.data?.get("uuid") as String?
        ?: ""

private fun removeOfflineAccessReferences(data: DataModel) {
    data.references = data.references?.filter {
        it.type.key != "5303" // offline-access
    }
}
