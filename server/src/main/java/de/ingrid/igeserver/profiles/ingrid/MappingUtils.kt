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
package de.ingrid.igeserver.profiles.ingrid

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import com.fasterxml.jackson.module.kotlin.readValue
import de.ingrid.igeserver.profiles.ingrid.exporter.convertStringToDocument
import de.ingrid.igeserver.profiles.ingrid.exporter.transformIDFtoIso
import de.ingrid.utils.ElasticDocument
import de.ingrid.utils.xml.XMLUtils

val inVeKoSKeywordMapping = mapOf(
    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/gsaa" to "GSAA",
    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/ecologicalFocusArea" to "Im Umweltinteresse genutzte Fläche",
    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/iacs" to "IACS",
    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/agriculturalArea" to "Landwirtschaftliche Fläche",
    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/lpis" to "LPIS",
    "http://inspire.ec.europa.eu/metadata-codelist/IACSData/referenceParcel" to "Referenzparzelle",
)

val hvdKeywordMapping = mapOf(
    "http://data.europa.eu/bna/c_ac64a52d" to "Georaum",
    "http://data.europa.eu/bna/c_dd313021" to "Erdbeobachtung und Umwelt",
    "http://data.europa.eu/bna/c_164e0bf5" to "Meteorologie",
    "http://data.europa.eu/bna/c_e1da4e07" to "Statistik",
    "http://data.europa.eu/bna/c_a9135398" to "Unternehmen und Eigentümerschaft von Unternehmen",
    "http://data.europa.eu/bna/c_b79e35eb" to "Mobilität",
)

val iso639LanguageMapping = mapOf(
    "ger" to "150",
    "eng" to "123",
    "bul" to "65",
    "cze" to "101",
    "dan" to "103",
    "spa" to "401",
    "fin" to "134",
    "fre" to "137",
    "gre" to "164",
    "hun" to "183",
    "dut" to "116",
    "pol" to "346",
    "por" to "348",
    "rum" to "360",
    "slo" to "385",
    "slv" to "386",
    "ita" to "202",
    "est" to "126",
    "lav" to "247",
    "lit" to "251",
    "nno" to "312",
    "rus" to "363",
    "swe" to "413",
    "mlt" to "284",
    "wen" to "467",
    "hsb" to "182",
    "dsb" to "113",
    "fry" to "142",
    "nds" to "306",
)

fun getISOFromElasticDocumentString(elasticString: String): String {
    val elasticDoc = jacksonObjectMapper().readValue<ElasticDocument>(elasticString)
    val idfDoc = convertStringToDocument(elasticDoc["idf"] as String)
    val isoDoc = transformIDFtoIso(idfDoc!!)
    return XMLUtils.toString(isoDoc)
}
