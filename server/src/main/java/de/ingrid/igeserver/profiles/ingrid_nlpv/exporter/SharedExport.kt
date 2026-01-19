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
package de.ingrid.igeserver.profiles.ingrid_nlpv.exporter

import de.ingrid.igeserver.profiles.ingrid_nlpv.exporter.transformer.GeodatasetTransformerNlpv
import de.ingrid.igeserver.profiles.ingrid_nlpv.exporter.transformer.GeoserviceTransformerNlpv
import de.ingrid.igeserver.profiles.ingrid_nlpv.exporter.transformer.PublicationTransformerNlpv
import kotlin.reflect.KClass

fun getNlpvModelTransformerClass(docType: String): KClass<out Any>? = when (docType) {
    "InGridGeoDataset" -> GeodatasetTransformerNlpv::class
    "InGridGeoService" -> GeoserviceTransformerNlpv::class
    "InGridPublication" -> PublicationTransformerNlpv::class
    else -> null
}

fun getNlpvTemplateForDocType(docType: String): String? = when (docType) {
    "InGridGeoDataset" -> "export/ingrid-nlpv/idf-geodataset-nlpv.jte"
    "InGridGeoService" -> "export/ingrid-nlpv/idf-geoservice-nlpv.jte"
    "InGridPublication" -> "export/ingrid-nlpv/idf-publication-nlpv.jte"
    else -> null
}
