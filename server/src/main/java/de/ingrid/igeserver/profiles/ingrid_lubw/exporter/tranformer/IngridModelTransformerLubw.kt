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
package de.ingrid.igeserver.profiles.ingrid_lubw.exporter.tranformer

import de.ingrid.igeserver.exporter.CodelistTransformer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerCache
import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.getString
import de.ingrid.mdek.upload.Config

class IngridModelTransformerLubw(
    model: IngridModel,
    catalogIdentifier: String,
    codelists: CodelistTransformer,
    config: Config,
    catalogService: CatalogService,
    cache: TransformerCache,
    doc: Document,
    documentService: DocumentService
) : IngridModelTransformer(
    model, catalogIdentifier, codelists, config, catalogService, cache, doc, documentService
) {

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
                pathDoc.uuid
            )
        }
    }


}