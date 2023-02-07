package de.ingrid.igeserver.exporter

import org.apache.logging.log4j.kotlin.logger
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.exporter.model.KeyValueModel
import java.util.*

 class TransformationTools {

    companion object {
        val log = logger()

        fun getISORealFromIGCNumber(igcNumber: Float): String? {
            return try {
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
        }

        /** returns java generated UUID via UUID.randomUUID()  */
        @kotlin.jvm.JvmStatic
        fun getRandomUUID(): String {
            return UUID.randomUUID().toString()
        }


        @kotlin.jvm.JvmStatic
        fun getLanguageISO639_2Value(language: KeyValueModel): String {
            if (language.key == null) return language.value
                ?: throw ServerException.withReason("Could not map document language: $language")
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
    }
}
