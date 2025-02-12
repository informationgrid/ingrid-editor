package de.ingrid.igeserver.profiles.uvp.extensions

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostArchivePayload
import de.ingrid.igeserver.profiles.uvp.UvpArchiveService
import de.ingrid.igeserver.profiles.uvp.WrapperAndDocId
import de.ingrid.igeserver.profiles.uvp.tasks.ArchiveType
import de.ingrid.igeserver.services.BehaviourService
import org.springframework.stereotype.Component

@Component
class UVPPostArchive(
    private val uvpArchiveService: UvpArchiveService,
    private val behaviourService: BehaviourService,
) : Filter<PostArchivePayload> {
    override val profiles = arrayOf("uvp")

    override fun invoke(payload: PostArchivePayload, context: Context): PostArchivePayload {
        val typeString = behaviourService.get(context.catalogId, "plugin.uvp.archive")?.data?.get("uvpArchiveType") as? String
        val type = ArchiveType.valueOf(uvpArchiveService.mapType(typeString))
        val dataset = WrapperAndDocId(payload.wrapperId, payload.publishedDoc.id!!)

        uvpArchiveService.updateValidUntilDate(listOf(dataset), type)
        return payload
    }
}
