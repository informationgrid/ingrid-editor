package de.ingrid.igeserver.persistence.filter.delete

import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.persistence.filter.PostDeletePayload
import de.ingrid.igeserver.zabbix.ZabbixService
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component

/**
 * Filter for processing steps after removing the document.
 */
@Component
@Profile("zabbix")
class PostDocumentRemoverZabbix @Autowired constructor(
    val zabbixService: ZabbixService
) : Filter<PostDeletePayload> {

    private companion object {
        private val log = LogManager.getLogger()
    }

    override val profiles = arrayOf("uvp")

    override fun invoke(payload: PostDeletePayload, context: Context): PostDeletePayload {

        // remove document from zabbix monitoring
        if (zabbixService.activatedCatalogs.contains(context.catalogId)) {
            zabbixService.deleteDocument(payload.document.uuid)
        }

        return payload
    }

}
