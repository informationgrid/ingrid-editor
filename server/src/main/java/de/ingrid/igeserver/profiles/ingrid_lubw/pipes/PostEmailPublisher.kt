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
package de.ingrid.igeserver.profiles.ingrid_lubw.pipes

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostPublishPayload
import de.ingrid.igeserver.utils.AuthUtils
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Component

/**
 *
 */
@Component
class PostEmailPublisher(
    @Lazy val publishEmailService: PublishEmailService,
    val authUtils: AuthUtils,
) : Filter<PostPublishPayload> {

    override val profiles = emptyArray<String>()

    override fun invoke(payload: PostPublishPayload, context: Context): PostPublishPayload {
        val isDataset = payload.wrapper.category == "data"
        if (!isDataset || !authUtils.isAuthor(context.principal!!)) return payload

        val doc = payload.document
        publishEmailService.sendEmail(doc, context.catalogId)

        return payload
    }
}
