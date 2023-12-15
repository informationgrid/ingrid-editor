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
package de.ingrid.igeserver.persistence.filter.unpublish

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostUnpublishPayload
import de.ingrid.igeserver.tasks.IndexingTask
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Filter for processing steps after unpublishing.
 */
@Component
@Profile("elasticsearch")
class PostDefaultDocumentUnpublisher(val indexTask: IndexingTask) :
    Filter<PostUnpublishPayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostUnpublishPayload, context: Context): PostUnpublishPayload {

        // remove from index
        this.indexTask.removeFromIndex(context.catalogId, payload.wrapper.uuid, payload.wrapper.category!!)

        return payload
    }

}
