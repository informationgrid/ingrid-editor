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
package de.ingrid.igeserver.persistence.filter.publish

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.profiles.uvp.tasks.UploadExpiredTask
import de.ingrid.mdek.upload.storage.Storage
import org.springframework.stereotype.Component

/**
 * Filter for validating document data send from the client before updating in the storage
 */
@Component
class PostUploadPublisher(val storage: Storage, val uploadExpiredTask: UploadExpiredTask?) : Filter<PostPublishPayload> {

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {
        val docId = payload.document.uuid

        val files = payload.type.getUploads(payload.document)
        storage.publishDataset(context.catalogId, docId, files)

        // immediately check expiry dates of uploads for this datasets
        uploadExpiredTask?.start(payload.document.id)

        return payload
    }
}
