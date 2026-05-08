package de.ingrid.igeserver.profiles.ingrid_lubw.pipes

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PreCreatePayload
import org.springframework.stereotype.Service

@Service
class PreCreateIdentifierInit : Filter<PreCreatePayload> {
    override val profiles = arrayOf("ingrid-lubw")

    override fun invoke(
        payload: PreCreatePayload,
        context: Context,
    ): PreCreatePayload {
        val doc = payload.document
        if (doc.type == "InGridGeoDataset") {
            doc.data.put("identifier", doc.uuid)
        }
        return payload
    }
}
