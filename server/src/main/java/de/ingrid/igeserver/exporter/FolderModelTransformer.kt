package de.ingrid.igeserver.exporter

import de.ingrid.igeserver.exporter.model.FolderModel
import de.ingrid.igeserver.exporter.model.KeyValueModel
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.utils.SpringContext

class FolderModelTransformer(
    val model: FolderModel,
    val catalogIdentifier: String,
    val codelist: CodelistTransformer,
    val type: KeyValueModel? = null,
) {
    companion object {
        val documentService: DocumentService? by lazy { SpringContext.getBean(DocumentService::class.java) }
    }

    val id = model.id
    val uuid = model.uuid
    val hierarchyParent = model.data._parent
    
    val category = documentService?.getWrapperByDocumentId(model.id)?.category

    val nextParent = AddressModelTransformer.documentService!!.getParentWrapper(model.id)?.uuid
}
