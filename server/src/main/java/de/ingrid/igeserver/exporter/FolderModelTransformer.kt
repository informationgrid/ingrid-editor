/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

    val nextParent = documentService!!.getParentWrapper(model.id)?.uuid
}
