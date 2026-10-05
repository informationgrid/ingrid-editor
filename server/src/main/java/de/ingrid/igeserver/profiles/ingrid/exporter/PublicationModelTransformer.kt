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
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneDocument
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LuceneKeyValue
import de.ingrid.igeserver.profiles.ingrid.exporter.model.lucene.LucenePublication

open class PublicationModelTransformer(transformerConfig: TransformerConfig) :
    IngridModelTransformer(transformerConfig) {

    override val hierarchyLevelName = "document"

    open val publication = data.publication
    val baseDataText = data.publication?.baseDataText
    val publisherOrPlaceholder =
        if (publication?.publisher.isNullOrEmpty()) "Location of the editor" else publication?.publisher

    override fun toLuceneDocument(
        catalog: Catalog,
        partner: String,
        provider: String,
    ): LuceneDocument {
        val doc = super.toLuceneDocument(catalog, partner, provider)
        return doc.copy(
            ingrid = doc.ingrid.copy(
                publication = data.publication?.let {
                    LucenePublication(
                        author = it.author,
                        publisher = it.publisher,
                        publishedIn = it.publishedIn,
                        placeOfPublication = it.placeOfPublication,
                        volume = it.volume,
                        pages = it.pages,
                        publicationDate = it.publicationDate,
                        location = it.location,
                        isbn = it.isbn,
                        publishingHouse = it.publishingHouse,
                        documentType = it.documentType?.let { dt ->
                            LuceneKeyValue(dt.key, dt.value)
                        },
                        baseDataText = it.baseDataText,
                        bibliographicData = it.bibliographicData,
                        explanation = it.explanation,
                    )
                },
            ),
        )
    }
}
