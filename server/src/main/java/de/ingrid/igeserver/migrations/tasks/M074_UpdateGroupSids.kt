package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.api.NotFoundException
import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.GroupService
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.kotlin.logger
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

/**
 * Update all group sids with group id instead of name
 */
@Service
class M074_UpdateGroups : MigrationBase("0.74") {

    private var log = logger()

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    lateinit var groupService: GroupService

    @Autowired
    lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager


    override fun exec() {
        log.info("Update acls for groups.")

        ClosableTransaction(transactionManager).use {
            try {
                setAuthentication()
                catalogService.getCatalogs().forEach { catalog: Catalog ->
                    log.info("Update Catalog: " + catalog.name)
                    updateGroupSidsOfCatalog(catalog.identifier)
                }
            } catch (e: NotFoundException) {
                log.debug("Cannot update acl entries to include BasePermission.ADMINISTRATION")
            }
        }
    }


    private fun updateGroupSidsOfCatalog(catalogIdentifier: String) {

        ClosableTransaction(transactionManager).use {
            groupService
                .getAll(catalogIdentifier)
                .forEach { group ->
                    val legacySid = "GROUP_" + group.name
                    val newSid = "GROUP_" + group.id

                    val sql = """
                                UPDATE acl_sid
                                SET sid = '$newSid'
                                WHERE sid = '$legacySid';
                            """.trimIndent()

                    entityManager.createNativeQuery(sql).executeUpdate()
                }
        }
    }


    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken(
                "Scheduler",
                "Task",
                listOf(
                    SimpleGrantedAuthority("cat-admin"),
                    SimpleGrantedAuthority("ROLE_ACL_ACCESS"), // needed for ACL changes
                )
            )
        SecurityContextHolder.getContext().authentication = auth
    }

}

