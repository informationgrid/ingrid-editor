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
