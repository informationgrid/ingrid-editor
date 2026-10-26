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
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.mdek.upload.UploadConfig
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service
import kotlin.reflect.KClass

/**
 * Like the [IngridIDFExporter], but the inspire keywords are exported without the
 * INSPIRE links used by [IngridModelTransformer.mapToInspireLink].
 */
@Service
class IngridIdfNoInspireLinksExporter(
    codelistHandler: CodelistHandler,
    config: UploadConfig,
    catalogService: CatalogService,
    @Lazy documentService: DocumentService,
    documentWrapperRepository: DocumentWrapperRepository,
) : IngridIDFExporter(codelistHandler, config, catalogService, documentService, documentWrapperRepository) {

    override val typeInfo = ExportTypeInfo(
        DocumentCategory.DATA,
        "ingridIDFNoInspireLinks",
        "Ingrid IDF (ohne INSPIRE-Links)",
        "Export von Ingrid Dokumenten IDF Format für die Anzeige im Portal. INSPIRE-Keywords werden ohne die INSPIRE-Links exportiert.",
        "text/xml",
        "xml",
        listOf("ingrid"),
        isPublic = false,
    )

    override fun getModelTransformerClass(docType: String): KClass<out Any>? = getNoInspireLinksTransformer(docType)
        ?: super.getModelTransformerClass(docType)

    private fun getNoInspireLinksTransformer(docType: String): KClass<out Any>? = when (docType) {
        "InGridSpecialisedTask" -> IngridModelNoInspireLinksTransformer::class
        "InGridGeoDataset" -> GeodatasetModelNoInspireLinksTransformer::class
        "InGridGeoService" -> GeodataserviceModelNoInspireLinksTransformer::class
        "InGridPublication" -> PublicationModelNoInspireLinksTransformer::class
        "InGridProject" -> ProjectModelNoInspireLinksTransformer::class
        "InGridDataCollection" -> DataCollectionModelNoInspireLinksTransformer::class
        "InGridInformationSystem" -> InformationSystemModelNoInspireLinksTransformer::class
        else -> null
    }
}

open class IngridModelNoInspireLinksTransformer(transformerConfig: TransformerConfig) : IngridModelTransformer(transformerConfig) {
    override fun mapToInspireLink(key: String?): String? = null
}

open class GeodatasetModelNoInspireLinksTransformer(transformerConfig: TransformerConfig) : GeodatasetModelTransformer(transformerConfig) {
    override fun mapToInspireLink(key: String?): String? = null
}

open class GeodataserviceModelNoInspireLinksTransformer(transformerConfig: TransformerConfig) : GeodataserviceModelTransformer(transformerConfig) {
    override fun mapToInspireLink(key: String?): String? = null
}

open class PublicationModelNoInspireLinksTransformer(transformerConfig: TransformerConfig) : PublicationModelTransformer(transformerConfig) {
    override fun mapToInspireLink(key: String?): String? = null
}

open class ProjectModelNoInspireLinksTransformer(transformerConfig: TransformerConfig) : ProjectModelTransformer(transformerConfig) {
    override fun mapToInspireLink(key: String?): String? = null
}

open class DataCollectionModelNoInspireLinksTransformer(transformerConfig: TransformerConfig) : DataCollectionModelTransformer(transformerConfig) {
    override fun mapToInspireLink(key: String?): String? = null
}

open class InformationSystemModelNoInspireLinksTransformer(transformerConfig: TransformerConfig) : InformationSystemModelTransformer(transformerConfig) {
    override fun mapToInspireLink(key: String?): String? = null
}
