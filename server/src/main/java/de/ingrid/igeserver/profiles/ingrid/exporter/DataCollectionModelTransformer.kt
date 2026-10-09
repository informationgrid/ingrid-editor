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

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneCatalogCategory
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDatabaseCollection
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDatabaseContent
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDocumentInGrid

open class DataCollectionModelTransformer(transformerConfig: TransformerConfig) : IngridModelTransformer(transformerConfig) {

    override val hierarchyLevelName = "database"

    val isAdVCompatible = data.properties?.isAdVCompatible ?: false
    val databaseContent =
        data.databaseContent?.map { content -> content.parameter + content.moreInfo?.let { " ($it)" } } ?: emptyList()
    val categoryCatalog = data.categoryCatalog ?: emptyList()
    val methodText = data.methodText
    val explanation = data.explanation
    fun hasContentInfo() = databaseContent.isNotEmpty() || categoryCatalog.isNotEmpty()

    override fun toLuceneDocument(
        catalog: Catalog,
        partner: String,
        provider: String,
    ): LuceneDocumentInGrid {
        val doc = super.toLuceneDocument(catalog, partner, provider)
        val cats = data.categoryCatalog?.map {
            LuceneCatalogCategory(
                title = codelists.getCatalogCodelistValue("3535", it.title) ?: it.title?.value ?: it.title?.key,
                date = it.date?.let { d -> formatDate(formatterISO, d) },
                edition = it.edition,
            )
        } ?: emptyList()
        val dbContent = data.databaseContent?.map {
            LuceneDatabaseContent(
                parameter = it.parameter,
                moreInfo = it.moreInfo,
            )
        } ?: emptyList()
        val hasDatabaseCollection = cats.isNotEmpty() || dbContent.isNotEmpty() || methodText != null || explanation != null

        return doc.copy(
            ingrid = doc.ingrid.copy(
                databaseCollection = if (hasDatabaseCollection) {
                    LuceneDatabaseCollection(
                        catalogCategories = cats,
                        databaseContent = dbContent,
                        method = methodText,
                        explanation = explanation,
                    )
                } else {
                    null
                },
            ),
        )
    }
}
