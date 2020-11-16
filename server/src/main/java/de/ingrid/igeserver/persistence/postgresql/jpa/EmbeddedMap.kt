package de.ingrid.igeserver.persistence.postgresql.jpa

/**
 * Default implementation of EmbeddedData which represents a simple Map.
 */
class EmbeddedMap : HashMap<String, Any?>(), EmbeddedData {

    companion object {
        @JvmStatic
        private val TYPE_NAME = ""
    }

    override val typeColumnValue: String
        get() = TYPE_NAME
}

fun embeddedMapOf(vararg pairs: Pair<String, Any?>): EmbeddedMap =
        if (pairs.isNotEmpty()) pairs.toMap(EmbeddedMap()) else EmbeddedMap()
