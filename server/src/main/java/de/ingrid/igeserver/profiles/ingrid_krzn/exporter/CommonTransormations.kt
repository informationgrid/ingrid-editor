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
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.profiles.ingrid_krzn.exporter

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
import java.net.URI
import kotlin.reflect.KClass

fun getKrznTransformer(docType: Enum<*>): KClass<out Any>? {
    if (docType !is InGridDocType) return null

    return when (docType) {
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

fun getPortalUrl(transformerConfig: TransformerConfig): String = URI(transformerConfig.config.uploadExternalUrl).let {
    if (it.scheme == null) "" else it.scheme + "://" + it.host
}
