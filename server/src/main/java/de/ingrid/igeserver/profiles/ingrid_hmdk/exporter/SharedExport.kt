/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
 * distributed under the Licence is distributed on an "AS IS" basis,F
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.ingrid_hmdk.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_hmdk.exporter.transformer.*
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.mapToKeyValue
import kotlin.reflect.KClass

fun amendHMDKDescriptiveKeywords(
    docData: JsonNode,
    codelists: CodelistTransformer,
    previousKeywords: List<Thesaurus>
): List<Thesaurus> {
    val publicationHmbTG = docData.getBoolean("publicationHmbTG") ?: false
    val informationHmbTG = docData.get("informationHmbTG")
        ?.mapNotNull { it.mapToKeyValue() }
        ?.map { KeyValue(it.key, codelists.getCatalogCodelistValue("informationsgegenstand", it)) }
        ?: emptyList()

    val keywords = previousKeywords.toMutableList()

    if (informationHmbTG.isNotEmpty()) {
        keywords += Thesaurus(
            keywords = informationHmbTG.map { KeywordIso(it.key) },
            date = "2013-08-02",
            name = "HmbTG-Informationsgegenstand",
            showType = true
        )
        keywords += Thesaurus(keywords = informationHmbTG.map { KeywordIso(it.value) })
    }

    if (publicationHmbTG)
        keywords += Thesaurus(keywords = listOf(KeywordIso(name = "hmbtg", link = null)))

    return keywords
}

fun getHmdkModelTransformerClass(docType: String): KClass<out Any>? {
    return when (docType) {
        "InGridSpecialisedTask" -> IngridModelTransformerHmdk::class
        "InGridGeoDataset" -> GeodatasetTransformerHmdk::class
        "InGridGeoService" -> GeoserviceTransformerHmdk::class
        "InGridPublication" -> PublicationModelTransformerHmdk::class
        "InGridProject" -> ProjectModelTransformerHmdk::class
        "InGridDataCollection" -> DataCollectionModelTransformerHmdk::class
        "InGridInformationSystem" -> InformationSystemModelTransformerHmdk::class
        else -> null
    }
}
