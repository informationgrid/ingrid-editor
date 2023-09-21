package de.ingrid.igeserver.tasks

import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.boot.context.event.ApplicationReadyEvent
import org.springframework.context.event.EventListener
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Component
import org.springframework.transaction.PlatformTransactionManager

@Component
class FixPathsTask(
    val entityManager: EntityManager,
    val transactionManager: PlatformTransactionManager,
) {
    val log = logger()

    private val sqlRootDocumentWrapper = """
        SELECT dw.id FROM DocumentWrapper dw WHERE dw.catalog.identifier=:catalogIdentifier AND dw.parent IS NULL
    """.trimIndent()

    private val updateWrapperPath = """
        UPDATE document_wrapper SET path=CAST(:path as int[]) WHERE id=:id
    """.trimIndent()

    @EventListener(ApplicationReadyEvent::class)
    fun onStartup() {
        val catalogs = getCatalogsForPostMigration()
        if (catalogs.isEmpty()) return

        setAuthentication()

        catalogs.forEach { catalog ->
            log.info("Execute FixPathsTask for catalog: $catalog")
            ClosableTransaction(transactionManager).use {
                migratePaths(catalog)
                removePostMigrationInfo(catalog)
                log.info("Finished FixPathsTask for catalog: $catalog")
            }
        }

    }


    fun migratePaths(catalogIdentifier: String) {
        val docWrappersRoot = entityManager.createQuery(sqlRootDocumentWrapper)
            .setParameter("catalogIdentifier", catalogIdentifier)
            .resultList

        docWrappersRoot.forEach { wrapperId ->
            addChildren(wrapperId as Int, mutableListOf())
        }
    }

    private fun addChildren(id: Int, previousUuids: MutableList<Int>) {

        previousUuids.add(id)
        val childrenIds = entityManager
            .createQuery("SELECT dw.id FROM DocumentWrapper dw where dw.parent is not null and dw.parent.id = $id")
            .resultList

        childrenIds.forEach { childId ->
            entityManager
                .createNativeQuery(updateWrapperPath)
                .setParameter("path", "{${previousUuids.joinToString()}}")
                .setParameter("id", childId)
                .executeUpdate()

            addChildren(childId as Int, previousUuids.toMutableList())
        }
    }


    private fun getCatalogsForPostMigration(): List<String> {
        return try {
            entityManager
                .createQuery(
                    "SELECT version FROM VersionInfo version WHERE version.key = 'doFixPaths'",
                    VersionInfo::class.java
                )
                .resultList
                .map { it.value!! }
        } catch (e: Exception) {
            log.warn("Could not query version_info table")
            emptyList()
        }
    }

    private fun removePostMigrationInfo(catalogIdentifier: String) {
        entityManager
            .createQuery(
                "DELETE FROM VersionInfo version WHERE version.key = 'doFixPaths' AND version.value = '${catalogIdentifier}'"
            )
            .executeUpdate()
    }

    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken(
                "System",
                "Task",
                listOf(
                    SimpleGrantedAuthority("cat-admin"),
                    SimpleGrantedAuthority("ROLE_ACL_ACCESS"), // needed for ACL changes
                )
            )
        SecurityContextHolder.getContext().authentication = auth
    }

}
