package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.services.DOCUMENT_STATE
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

@Service
class M059_RefactorDocumentWrapper : MigrationBase("0.59") {
    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    private val allWrapper = """SELECT published, draft, pending, id FROM document_wrapper"""
    private val updateDocument = """UPDATE document SET is_latest=?1, state=?2 WHERE id=?3"""

    override fun exec() {
        ClosableTransaction(transactionManager).use {
            val wrappers: MutableList<Any?> = entityManager.createNativeQuery(allWrapper).resultList

            setAuthentication()

            wrappers.forEach { wrapper ->
                try {
                    val obj = wrapper as Array<*>
                    migrateWrapper(obj[0] as Int?, obj[1] as Int?, obj[2] as Int?)
                } catch (ex: Exception) {
                    log.error("Error migrating document with dbID ${(wrapper as Array<*>)[3]}", ex)
                }
            }
        }
    }

    private fun migrateWrapper(publishedId: Int?, draftId: Int?, pendingId: Int?) {
        if (draftId != null) {
            val state = if (publishedId != null) DOCUMENT_STATE.DRAFT_AND_PUBLISHED else DOCUMENT_STATE.DRAFT
            entityManager.createNativeQuery(updateDocument)
                .setParameter(1, true)
                .setParameter(2, state.toString())
                .setParameter(3, draftId)
                .executeUpdate()
        }

        if (publishedId != null) {
            entityManager.createNativeQuery(updateDocument)
                .setParameter(1, draftId == null)
                .setParameter(2, DOCUMENT_STATE.PUBLISHED.toString())
                .setParameter(3, publishedId)
                .executeUpdate()
        }

        if (pendingId != null) {
            entityManager.createNativeQuery(updateDocument)
                .setParameter(1, true)
                .setParameter(2, DOCUMENT_STATE.PENDING.toString())
                .setParameter(3, pendingId)
                .executeUpdate()
        }
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
