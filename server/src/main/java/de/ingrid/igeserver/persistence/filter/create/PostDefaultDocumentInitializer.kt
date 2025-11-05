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
package de.ingrid.igeserver.persistence.filter.create

import de.ingrid.igeserver.api.TagRequest
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostCreatePayload
import de.ingrid.igeserver.services.BehaviourService
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

@Component
class PostDefaultDocumentInitializer(
    val behaviourService: BehaviourService,
    @Lazy val documentService: DocumentService,
) : Filter<PostCreatePayload> {

    override val profiles = arrayOf<String>()

    override fun invoke(payload: PostCreatePayload, context: Context): PostCreatePayload {
        setPublicationType(payload, context)

        return payload
    }

    private fun setPublicationType(payload: PostCreatePayload, context: Context) {
        val defaultPublicationType = behaviourService.get(context.catalogId, "plugin.tags")?.data?.get("defaultPublicationType") as? String
        if (defaultPublicationType == null || defaultPublicationType.lowercase() == "internet") {
            // default is internet. no need to update tags
        } else {
            documentService.updateTags(context.catalogId, payload.wrapper.id!!, TagRequest(add = listOf(defaultPublicationType), remove = emptyList()))
        }
    }
}
