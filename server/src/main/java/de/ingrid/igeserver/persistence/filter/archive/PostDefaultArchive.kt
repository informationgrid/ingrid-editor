/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.persistence.filter.archive

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostArchivePayload
import de.ingrid.igeserver.profiles.uvp.exporter.model.DataModel.Companion.behaviourService
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

@Component
@Order(10)
class PostDefaultArchive(private val behaviourService: BehaviourService, private val indexingTask: IndexingTask) : Filter<PostArchivePayload> {

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostArchivePayload, context: Context): PostArchivePayload {
        val showInPortal = behaviourService.get(context.catalogId, "plugin.archive")?.data?.get("showInPortal") as? Boolean == true

        if (showInPortal) {
            indexingTask.updateDocument(context.catalogId, DocumentCategory.DATA, payload.publishedDoc.uuid)
        } else {
            indexingTask.removeFromIndex(context.catalogId, payload.publishedDoc.uuid, DocumentCategory.DATA.value)
        }
        return payload
    }
}
