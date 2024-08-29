/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.elasticsearch

import java.io.Serializable

data class IndexInfo(
    var toIndex: String,
    var _toAlias: String? = null,
    var docIdField: String? = null,
) : Serializable {
    private var realIndexName: String? = null
    fun getRealIndexName(): String = realIndexName ?: toIndex

    fun setRealIndexName(realIndexName: String?) {
        this.realIndexName = realIndexName
    }

    val toAlias = _toAlias
        get() = field ?: toIndex

    companion object {
        private const val serialVersionUID = -2290409004042430234L
    }
}
