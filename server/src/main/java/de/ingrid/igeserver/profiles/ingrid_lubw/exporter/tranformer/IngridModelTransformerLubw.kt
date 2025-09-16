/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer

import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.getEnvironmentDescription
import de.ingrid.igeserver.profiles.ingrid_lubw.exporter.getOAC
import de.ingrid.igeserver.utils.getString

class IngridModelTransformerLubw(transformerConfig: TransformerConfig) : IngridModelTransformer(transformerConfig) {

    private val docData = doc.data
    val oac = getOAC(docData)
    val environmentDescription = getEnvironmentDescription(docData)

    // if the document is a service with "Zugang geschützt" or it is a geoservice or geodataset with access constraints other than "1" ("Es gelten keine Zugriffsbeschränkungen") #4377 #7280
    override fun hasAccessConstraints(): Boolean = super.hasAccessConstraints() ||
        (listOf("InGridGeoDataset", "InGridGeoService").contains(doc.type) && (data.resource?.accessConstraints?.any { it.key != "1" } == true))

    val treePathNames: List<String>
    val treePathUuids: List<String>
    val distributor: String

    init {
        val treePath = getTreePath()
        treePathNames = treePath.map { it.name }
        treePathUuids = treePath.map { it.uuid }
        distributor = getDistributorName()
    }

    private fun getDistributorName(): String {
        val distributor = orderInfoContact.firstOrNull() ?: return ""
        val oldestAncestorData = distributor.ancestorAddressesIncludingSelf.first().document.data
        return oldestAncestorData.getString("organization") ?: oldestAncestorData.getString("lastName") ?: "???"
    }

    private data class TreeNode(val name: String, val uuid: String)

    private fun getTreePath(): List<TreeNode> {
        val wrapper = documentService.getWrapperByCatalogAndDocumentUuid(catalogIdentifier, doc.uuid)
        return wrapper.path.map {
            val pathDoc = documentService.getDocumentByWrapperId(catalogIdentifier, it)
            TreeNode(
                pathDoc.title ?: "???",
                pathDoc.uuid,
            )
        }
    }
}
