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
package de.ingrid.igeserver.profiles.ingrid_bkg.exporter

import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer.DataCollectionTransformerBkg
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer.GeodatasetTransformerBkg
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer.GeoserviceTransformerBkg
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer.InformationSystemModelTransformerBkg
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer.ProjectModelTransformerBkg
import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer.PublicationModelTransformerBkg
import kotlin.reflect.KClass

fun getBkgTransformer(docType: String): KClass<out Any>? = when (docType) {
    "InGridGeoDataset" -> GeodatasetTransformerBkg::class
    "InGridGeoService" -> GeoserviceTransformerBkg::class
    "InGridDataCollection" -> DataCollectionTransformerBkg::class
//    "InGridSpecialisedTask" -> IngridModelTransformerBkg::class
    "InGridPublication" -> PublicationModelTransformerBkg::class
    "InGridProject" -> ProjectModelTransformerBkg::class
    "InGridInformationSystem" -> InformationSystemModelTransformerBkg::class
//    "InGridOrganisationDoc" -> AddressModelTransformer::class
//    "InGridPersonDoc" -> AddressModelTransformer::class
    else -> null
}
