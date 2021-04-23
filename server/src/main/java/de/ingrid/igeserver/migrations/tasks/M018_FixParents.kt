package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.DocumentService
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
    lateinit var docRepo: DocumentRepository

    @Autowired
    lateinit var docWrapperRepo: DocumentWrapperRepository

    override fun exec() {

//            val allDocs = dbService.findAll(DocumentType::class)
        val allDocs = docRepo.findAll()
        var count = 0
        var successful = 0
        var noWrapper = 0

        allDocs
            .filter { !it.data.has(FIELD_PARENT) || it.data[FIELD_PARENT] == null }
            .forEach {
                count++
                try {
                    val wrapper = docService.getWrapperByDocumentId(it.uuid, false)
                    val wrapperParent = wrapper.parent
                    if (wrapperParent != null) {
                        it.uuid = wrapperParent.uuid
                        successful++
                        docRepo.save(it)
                    } else {
                        docWrapperRepo.save(wrapper)
                        // count back since this must be a root element
                        count--
                    }
                } catch (e: Exception) {
                    noWrapper++
                }
            }

        log.info("Migrated missing parents from wrapper to document for ${count} documents.")
        if (count != successful) {
            log.warn("${count - successful} docs could not be migrated (missing wrapper?)")
            log.warn("${noWrapper} documents have no wrapper")
        }
    }

}
