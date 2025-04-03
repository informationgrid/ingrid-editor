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
package de.ingrid.igeserver.profiles.uvp.extensions

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostArchivePayload
import de.ingrid.igeserver.profiles.uvp.UvpArchiveService
import de.ingrid.igeserver.profiles.uvp.WrapperAndDocId
import de.ingrid.igeserver.profiles.uvp.tasks.ArchiveType
import de.ingrid.igeserver.services.BehaviourService
import org.springframework.core.annotation.Order
import org.springframework.stereotype.Component

@Component
@Order(1) // run before default post archive task, to index modified document
class UVPPostArchive(
    private val uvpArchiveService: UvpArchiveService,
    private val behaviourService: BehaviourService,
) : Filter<PostArchivePayload> {
    override val profiles = arrayOf("uvp")

    override fun invoke(payload: PostArchivePayload, context: Context): PostArchivePayload {
        if (payload.publishedDoc == null) return payload

        val typeString = behaviourService.get(context.catalogId, "plugin.uvp.archive")?.data?.get("uvpArchiveType") as? String
        val type = ArchiveType.valueOf(uvpArchiveService.mapType(typeString))
        val dataset = WrapperAndDocId(payload.wrapperId, payload.publishedDoc.id!!, payload.publishedDoc.type)

        uvpArchiveService.updateValidUntilDate(listOf(dataset), type)
        return payload
    }
}
