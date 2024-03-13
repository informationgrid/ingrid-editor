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
package de.ingrid.igeserver.index

import de.ingrid.elasticsearch.IndexInfo
import de.ingrid.utils.ElasticDocument


interface IIndexManager {
    val name: String
    
    fun getIndexNameFromAliasName(indexAlias: String, partialName: String?): String?

    fun createIndex(name: String, type: String, esMapping: String, esSettings: String): Boolean

    fun switchAlias(aliasName: String, oldIndex: String?, newIndex: String)

    fun checkAndCreateInformationIndex()

    fun update(indexinfo: IndexInfo, doc: ElasticDocument)

    fun updateIPlugInformation(id: String, info: String)

    fun flush()

    fun deleteIndex(index: String)

    fun getIndices(filter: String): List<String>

    fun delete(indexinfo: IndexInfo, id: String, updateOldIndex: Boolean)

    fun indexExists(indexName: String): Boolean
}