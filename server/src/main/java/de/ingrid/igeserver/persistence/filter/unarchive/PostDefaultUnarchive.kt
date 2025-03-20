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
package de.ingrid.igeserver.persistence.filter.unarchive

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostUnarchivePayload
import de.ingrid.igeserver.services.DocumentCategory
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

@Component
@Order(10)
class PostDefaultUnarchive(private val indexingTask: IndexingTask) : Filter<PostUnarchivePayload> {

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostUnarchivePayload, context: Context): PostUnarchivePayload {
        if (payload.publishedDoc == null) return payload

        indexingTask.updateDocument(context.catalogId, DocumentCategory.DATA, payload.publishedDoc.uuid)
        return payload
    }
}
