/**
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.model.ServiceUrl
import de.ingrid.igeserver.profiles.ingrid.types.InGridDocType
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.transformer.DataCollectionTransformerKrzn
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.transformer.GeodatasetTransformerKrzn
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.transformer.GeoserviceTransformerKrzn
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.transformer.InformationSystemTransformerKrzn
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.transformer.ProjectTransformerKrzn
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.transformer.PublicationTransformerKrzn
import de.ingrid.igeserver.profiles.ingrid_krzn.exporter.transformer.SpecializedTaskTransformerKrzn
import de.ingrid.igeserver.utils.getString
import java.net.URI
import kotlin.reflect.KClass

fun getKrznTransformer(docType: String): KClass<out Any>? {
    val inGridDocType = InGridDocType.entries.find { it.name == docType } ?: return null

    return when (inGridDocType) {
        InGridDocType.InGridGeoDataset -> GeodatasetTransformerKrzn::class
        InGridDocType.InGridGeoService -> GeoserviceTransformerKrzn::class
        InGridDocType.InGridDataCollection -> DataCollectionTransformerKrzn::class
        InGridDocType.InGridInformationSystem -> InformationSystemTransformerKrzn::class
        InGridDocType.InGridPublication -> PublicationTransformerKrzn::class
        InGridDocType.InGridProject -> ProjectTransformerKrzn::class
        InGridDocType.InGridSpecialisedTask -> SpecializedTaskTransformerKrzn::class
    }
}

fun getInternalReferences(modelTransformer: IngridModelTransformer, codelists: CodelistTransformer) = modelTransformer.referencesWithUuidRefs.map {
    ServiceUrl(
        it.title,
        "${getPortalUrl(modelTransformer.transformerConfig)}/trefferanzeige?docuuid=${it.uuidRef}",
        it.explanation,
        functionValue = codelists.getValue("2000", KeyValue(it.type.key), "iso") ?: "information",
    )
}

fun getPortalUrl(transformerConfig: TransformerConfig): String = URI(transformerConfig.uploadConfig.uploadExternalUrl).let {
    if (it.scheme == null) "" else it.scheme + "://" + it.host
}

fun getMapLink(data: JsonNode?, uuid: String, codelists: CodelistTransformer): String? {
    val zoom = data?.getString("mapZoomLevel")
    val center = data?.getString("mapCenter")
    return data?.getString("mapLink.key")?.let { linkKey ->
        // do not map specific entry where we do not want to show mapUrl
        if (linkKey == "0") return@let null
        codelists.getCatalogCodelistValue("10500", KeyValue(linkKey, null))
            ?.replace("{ID}", uuid)
            ?.let { url ->
                val mapsParameter = buildString {
                    append("&MAPS={")
                    if (center != null) {
                        append("%22center%22:[$center]")
                    }
                    if (zoom != null) {
                        if (center != null) append(",") // Komma nur, wenn `center` vorhanden ist
                        append("%22zoom%22:$zoom")
                    }
                    append("}")
                }.takeIf { it != "&MAPS={}" } // Nur hinzufügen, wenn mindestens ein Parameter existiert
                url + (mapsParameter ?: "")
            }
    }
}
