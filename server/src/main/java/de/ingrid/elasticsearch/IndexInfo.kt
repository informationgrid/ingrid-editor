package de.ingrid.elasticsearch

import java.io.Serializable

data class IndexInfo(
    var toIndex: String,

    @Deprecated("")
    var toType: String? = null,
    var _toAlias: String? = null,
//        
    var docIdField: String? = null
): Serializable {
    private var realIndexName: String? = null
    fun getRealIndexName(): String? {
        if (realIndexName == null) {
            return toIndex
        }
        return realIndexName
    }

    fun setRealIndexName(realIndexName: String?) {
        this.realIndexName = realIndexName
    }

    val toAlias = _toAlias
        get() = field ?: toIndex
    
    val identifier: String
        get() = toIndex + "." + toType

    companion object {
        private const val serialVersionUID = -2290409004042430234L
    }
}