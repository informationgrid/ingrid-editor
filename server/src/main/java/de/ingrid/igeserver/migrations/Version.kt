package de.ingrid.igeserver.migrations

import kotlin.math.max

class Version(inputVersion: String) : Comparable<Version> {

    var version: String
        private set

    override fun compareTo(other: Version) =
            (split() to other.split()).let {(thisParts, thatParts)->
                val length = max(thisParts.size, thatParts.size)
                for (i in 0 until length) {
                    val thisPart = if (i < thisParts.size) thisParts[i].toInt() else 0
                    val thatPart = if (i < thatParts.size) thatParts[i].toInt() else 0
                    if (thisPart < thatPart) return -1
                    if (thisPart > thatPart) return 1
                }
                0
            }

    init {
        require(inputVersion.matches("[0-9]+(\\.[0-9]+)*".toRegex())) { "Invalid version format" }
        version = inputVersion
    }
}

fun Version.split() = version.split(".").toTypedArray()