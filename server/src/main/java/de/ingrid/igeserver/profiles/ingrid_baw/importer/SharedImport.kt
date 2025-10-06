/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_baw.importer

import de.ingrid.igeserver.exports.iso.MDDataIdentification
import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.model.KeyValue

val BAW_THESAURI = listOf(
    "BAW-Schlagwortkatalog",
    "Baugrunddynamik-Schlagwortkatalog",
    "de.baw.codelist.model.dimensionality",
    "de.baw.codelist.model.method",
    "de.baw.codelist.model.type",
)

fun hierarchyLevelNameToDocumentType(hierarchyLevelName: String?): String = when (hierarchyLevelName) {
    "Simulation",
    "Postprocessing",
    "Preprocessing",
    "Variante",
    "Visualisierung",
    "Szenario",
    "Simulationsmodell",
    "Simulationslauf",
    "Simulationsdatei",
    -> "BawSimulation"

    "measurement",
    "Messdaten",
    -> "BawMeasurement"

    else -> "InGridGeoDataset"
}

fun getBawKeywords(metadata: Metadata): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
    ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "BAW-Schlagwortkatalog" }
    ?.flatMap { thesaurus -> thesaurus.keywords?.keyword?.mapNotNull { it.value } ?: emptyList() }
    ?.map { KeyValue(it) } ?: emptyList()

fun getSubsoilKeywords(metadata: Metadata): List<KeyValue> = metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
    ?.filter { it.keywords?.thesaurusName?.citation?.title?.value == "Baugrunddynamik-Schlagwortkatalog" }
    ?.flatMap { thesaurus -> thesaurus.keywords?.keyword?.mapNotNull { it.value } ?: emptyList() }
    ?.map { KeyValue(it) } ?: emptyList()

fun getLiteratureReferences(identificationInfo: MDDataIdentification?): List<String> = identificationInfo?.aggregationInfo?.mapNotNull { it.mdAggregateInformation?.aggregateDataSetName?.uuidref } ?: emptyList()
