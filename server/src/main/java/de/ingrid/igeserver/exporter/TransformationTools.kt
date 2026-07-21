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
package de.ingrid.igeserver.exporter

import org.apache.logging.log4j.kotlin.logger
import java.util.*

class TransformationTools {

    companion object {
        val log = logger()

        @kotlin.jvm.JvmStatic
        fun bytesToMegabytes(i: Number): Number = i.toDouble() / 1_000_000

        @kotlin.jvm.JvmStatic
        fun hasValue(d: Double?) = d != null && !d.isNaN() && !d.isInfinite()

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
        } catch (_: NumberFormatException) {
            log.warn("Could not convert to ISO gco:Real: $igcNumber")
            "NaN"
        }

        /** returns java generated UUID via UUID.randomUUID()  */
        @kotlin.jvm.JvmStatic
        fun getRandomUUID(): String = UUID.randomUUID().toString()
    }
}
