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
package de.ingrid.igeserver.migrations

import kotlin.math.max

class Version(inputVersion: String) : Comparable<Version> {

    var version: String
        private set

    override fun compareTo(other: Version) =
        (split() to other.split()).let { (thisParts, thatParts) ->
            val length = max(thisParts.size, thatParts.size)
            for (i in 0 until length) {
                val thisPart = if (i < thisParts.size) thisParts[i].toInt() else 0
                val thatPart = if (i < thatParts.size) thatParts[i].toInt() else 0
                if (thisPart < thatPart) return -1
                if (thisPart > thatPart) return 1
            }
            0
        }

    override fun toString(): String {
        return version
    }

    init {
        require(inputVersion.matches("[0-9]+(\\.[0-9]+)*".toRegex())) { "Invalid version format" }
        version = inputVersion
    }
}

fun Version.split() = version.split(".").toTypedArray()
