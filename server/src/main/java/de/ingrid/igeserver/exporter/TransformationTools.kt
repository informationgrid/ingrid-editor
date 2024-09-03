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
package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.model.KeyValue
import org.apache.logging.log4j.kotlin.logger
import java.util.*

class TransformationTools {

    companion object {
        val log = logger()

        @kotlin.jvm.JvmStatic
        fun hasValue(s: String?) = !s.isNullOrEmpty()

        @kotlin.jvm.JvmStatic
        fun hasValue(s: List<Any>?) = !s.isNullOrEmpty()

        @kotlin.jvm.JvmStatic
        fun getISORealFromIGCNumber(igcNumber: Float): String? = try {
            val n = igcNumber.toDouble()
            if (java.lang.Double.isNaN(n)) {
                "NaN"
            } else if (java.lang.Double.isInfinite(n)) {
                "INF"
            } else {
                n.toString()
            }
        } catch (e: NumberFormatException) {
            log.warn("Could not convert to ISO gco:Real: $igcNumber")
            "NaN"
        }

        /** returns java generated UUID via UUID.randomUUID()  */
        @kotlin.jvm.JvmStatic
        fun getRandomUUID(): String = UUID.randomUUID().toString()

        // TODO: move to MappingUtils class and refactor to use already present map iso639LanguageMapping
        @kotlin.jvm.JvmStatic
        fun getLanguageISO639v2Value(language: KeyValue): String {
            if (language.key == null) {
                return language.value
                    ?: throw ServerException.withReason("Could not map document language: $language")
            }
            return when (language.key) {
                "150" -> "ger"
                "123" -> "eng"
                "65" -> "bul"
                "101" -> "cze"
                "103" -> "dan"
                "401" -> "spa"
                "134" -> "fin"
                "137" -> "fre"
                "164" -> "gre"
                "183" -> "hun"
                "116" -> "dut"
                "346" -> "pol"
                "348" -> "por"
                "360" -> "rum"
                "385" -> "slo"
                "386" -> "slv"
                "202" -> "ita"
                "126" -> "est"
                "247" -> "lav"
                "251" -> "lit"
                "312" -> "nno"
                "363" -> "rus"
                "413" -> "swe"
                "284" -> "mlt"
                "467" -> "wen"
                "182" -> "hsb"
                "113" -> "dsb"
                "142" -> "fry"
                "306" -> "nds"
                else -> throw ServerException.withReason("Could not map document language key: language.key")
            }
        }

        @kotlin.jvm.JvmStatic
        fun getISO3166v1Alpha3FromNumericLanguageCode(language: KeyValue): String {
            if (language.key == null) {
                return language.value
                    ?: throw ServerException.withReason("Could not map document language: $language")
            }
            return when (language.key) {
                "4" -> "AFG"
                "818" -> "EGY"
                "248" -> "ALA"
                "8" -> "ALB"
                "12" -> "DZA"
                "850" -> "VIR"
                "16" -> "ASM"
                "20" -> "AND"
                "24" -> "AGO"
                "660" -> "AIA"
                "10" -> "ATA"
                "28" -> "ATG"
                "226" -> "GNQ"
                "32" -> "ARG"
                "51" -> "ARM"
                "533" -> "ABW"
                "31" -> "AZE"
                "231" -> "ETH"
                "36" -> "AUS"
                "44" -> "BHS"
                "48" -> "BHR"
                "50" -> "BGD"
                "52" -> "BRB"
                "112" -> "BLR"
                "56" -> "BEL"
                "84" -> "BLZ"
                "204" -> "BEN"
                "60" -> "BMU"
                "64" -> "BTN"
                "68" -> "BOL"
                "70" -> "BIH"
                "72" -> "BWA"
                "74" -> "BVT"
                "76" -> "BRA"
                "92" -> "VGB"
                "86" -> "IOT"
                "96" -> "BRN"
                "100" -> "BGR"
                "854" -> "BFA"
                "108" -> "BDI"
                "152" -> "CHL"
                "156" -> "CHN"
                "184" -> "COK"
                "188" -> "CRI"
                "384" -> "CIV"
                "208" -> "DNK"
                "276" -> "DEU"
                "212" -> "DMA"
                "214" -> "DOM"
                "262" -> "DJI"
                "218" -> "ECU"
                "222" -> "SLV"
                "232" -> "ERI"
                "233" -> "EST"
                "238" -> "FLK"
                "234" -> "FRO"
                "242" -> "FJI"
                "246" -> "FIN"
                "250" -> "FRA"
                "260" -> "ATF"
                "254" -> "GUF"
                "258" -> "PYF"
                "266" -> "GAB"
                "270" -> "GMB"
                "268" -> "GEO"
                "288" -> "GHA"
                "292" -> "GIB"
                "308" -> "GRD"
                "300" -> "GRC"
                "304" -> "GRL"
                "312" -> "GLP"
                "316" -> "GUM"
                "320" -> "GTM"
                "831" -> "GGY"
                "324" -> "GIN"
                "624" -> "GNB"
                "328" -> "GUY"
                "332" -> "HTI"
                "334" -> "HMD"
                "340" -> "HND"
                "344" -> "HKG"
                "356" -> "IND"
                "360" -> "IDN"
                "833" -> "IMN"
                "368" -> "IRQ"
                "364" -> "IRN"
                "372" -> "IRL"
                "352" -> "ISL"
                "376" -> "ISR"
                "380" -> "ITA"
                "388" -> "JAM"
                "392" -> "JPN"
                "887" -> "YEM"
                "832" -> "JEY"
                "400" -> "JOR"
                "136" -> "CYM"
                "116" -> "KHM"
                "120" -> "CMR"
                "124" -> "CAN"
                "132" -> "CPV"
                "398" -> "KAZ"
                "634" -> "QAT"
                "404" -> "KEN"
                "417" -> "KGZ"
                "296" -> "KIR"
                "166" -> "CCK"
                "170" -> "COL"
                "174" -> "COM"
                "180" -> "COD"
                "408" -> "PRK"
                "410" -> "KOR"
                "191" -> "HRV"
                "192" -> "CUB"
                "414" -> "KWT"
                "418" -> "LAO"
                "426" -> "LSO"
                "428" -> "LVA"
                "422" -> "LBN"
                "430" -> "LBR"
                "434" -> "LBY"
                "438" -> "LIE"
                "440" -> "LTU"
                "442" -> "LUX"
                "446" -> "MAC"
                "450" -> "MDG"
                "454" -> "MWI"
                "458" -> "MYS"
                "462" -> "MDV"
                "466" -> "MLI"
                "470" -> "MLT"
                "504" -> "MAR"
                "584" -> "MHL"
                "474" -> "MTQ"
                "478" -> "MRT"
                "480" -> "MUS"
                "175" -> "MYT"
                "807" -> "MKD"
                "484" -> "MEX"
                "583" -> "FSM"
                "498" -> "MDA"
                "492" -> "MCO"
                "496" -> "MNG"
                "499" -> "MNE"
                "500" -> "MSR"
                "508" -> "MOZ"
                "104" -> "MMR"
                "516" -> "NAM"
                "520" -> "NRU"
                "524" -> "NPL"
                "540" -> "NCL"
                "554" -> "NZL"
                "558" -> "NIC"
                "528" -> "NLD"
                "530" -> "ANT"
                "562" -> "NER"
                "566" -> "NGA"
                "570" -> "NIU"
                "580" -> "MNP"
                "574" -> "NFK"
                "578" -> "NOR"
                "512" -> "OMN"
                "40" -> "AUT"
                "626" -> "TLS"
                "586" -> "PAK"
                "275" -> "PSE"
                "585" -> "PLW"
                "591" -> "PAN"
                "598" -> "PNG"
                "600" -> "PRY"
                "604" -> "PER"
                "608" -> "PHL"
                "612" -> "PCN"
                "616" -> "POL"
                "620" -> "PRT"
                "630" -> "PRI"
                "158" -> "TWN"
                "178" -> "COG"
                "638" -> "REU"
                "646" -> "RWA"
                "642" -> "ROU"
                "643" -> "RUS"
                "652" -> "BLM"
                "663" -> "MAF"
                "90" -> "SLB"
                "894" -> "ZMB"
                "882" -> "WSM"
                "674" -> "SMR"
                "678" -> "STP"
                "682" -> "SAU"
                "752" -> "SWE"
                "756" -> "CHE"
                "686" -> "SEN"
                "688" -> "SRB"
                "690" -> "SYC"
                "694" -> "SLE"
                "716" -> "ZWE"
                "702" -> "SGP"
                "703" -> "SVK"
                "705" -> "SVN"
                "706" -> "SOM"
                "724" -> "ESP"
                "144" -> "LKA"
                "654" -> "SHN"
                "659" -> "KNA"
                "662" -> "LCA"
                "666" -> "SPM"
                "670" -> "VCT"
                "710" -> "ZAF"
                "736" -> "SDN"
                "239" -> "SGS"
                "740" -> "SUR"
                "744" -> "SJM"
                "748" -> "SWZ"
                "760" -> "SYR"
                "762" -> "TJK"
                "834" -> "TZA"
                "764" -> "THA"
                "768" -> "TGO"
                "772" -> "TKL"
                "776" -> "TON"
                "780" -> "TTO"
                "148" -> "TCD"
                "203" -> "CZE"
                "788" -> "TUN"
                "792" -> "TUR"
                "795" -> "TKM"
                "796" -> "TCA"
                "798" -> "TUV"
                "800" -> "UGA"
                "804" -> "UKR"
                "348" -> "HUN"
                "581" -> "UMI"
                "858" -> "URY"
                "860" -> "UZB"
                "548" -> "VUT"
                "336" -> "VAT"
                "862" -> "VEN"
                "784" -> "ARE"
                "840" -> "USA"
                "826" -> "GBR"
                "704" -> "VNM"
                "876" -> "WLF"
                "162" -> "CXR"
                "732" -> "ESH"
                "140" -> "CAF"
                "196" -> "CYP"
                else -> throw ServerException.withReason("Could not map document language key: language.key")
            }
        }
    }
}
