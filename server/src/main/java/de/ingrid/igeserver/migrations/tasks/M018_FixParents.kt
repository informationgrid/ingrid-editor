package de.ingrid.igeserver.migrations.tasks

import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.DBApi
import de.ingrid.igeserver.persistence.model.document.DocumentType
import de.ingrid.igeserver.persistence.model.document.DocumentWrapperType
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.FIELD_ID
import de.ingrid.igeserver.services.FIELD_PARENT
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Service

@Service
class M018_FixParents : MigrationBase("0.18") {

    private var log = logger()

    @Autowired
    lateinit var docService: DocumentService

    @Autowired
    lateinit var dbService: DBApi

    override fun exec() {

        dbService.acquireDatabase().use {
            val allDocs = dbService.findAll(DocumentType::class)
            var count = 0
            var successful = 0
            var noWrapper = 0

            allDocs
                    .filter { it.get(FIELD_PARENT) == null || it.get(FIELD_PARENT).asText().isEmpty() }
                    .forEach {
                        count++
                        try {
                            val wrapper = docService.getWrapperByDocumentId(it.get(FIELD_ID).asText(), false)
                            if (wrapper != null) {
                                val wrapperParent = wrapper.get(FIELD_PARENT)
                                if (wrapperParent != null && !wrapperParent.asText().isEmpty() && wrapperParent.asText() != "null") {
                                    (it as ObjectNode).put(FIELD_PARENT, wrapperParent.asText());
                                    val recordId = dbService.getRecordId(it)
                                    successful++
                                    dbService.save(DocumentType::class, recordId, it.toString())
                                } else {

                                    if (wrapperParent.asText() == "null") {
                                        val wrapperRecordId = dbService.getRecordId(wrapper)
                                        dbService.save(DocumentWrapperType::class, wrapperRecordId, wrapper.toString())
                                    }
                                    // count back since this must be a root element
                                    count--
                                }
                            }
                        } catch (e: Exception) { noWrapper++ }
                    }

            log.info("Migrated missing parents from wrapper to document for ${count} documents.")
            if (count != successful) {
                log.warn("${count - successful} docs could not be migrated (missing wrapper?)")
                log.warn("${noWrapper} documents have no wrapper")
            }
        }
    }

}
