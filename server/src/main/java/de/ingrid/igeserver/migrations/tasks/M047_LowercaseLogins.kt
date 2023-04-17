package de.ingrid.igeserver.migrations.tasks

import de.ingrid.igeserver.migrations.MigrationBase
import de.ingrid.igeserver.persistence.postgresql.jpa.ClosableTransaction
import de.ingrid.igeserver.repository.UserRepository
import jakarta.persistence.EntityManager
import org.apache.logging.log4j.LogManager
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.Authentication
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.stereotype.Service
import org.springframework.transaction.PlatformTransactionManager

/**
 * Transform userIds of users to lowercase
 */
@Service
class M047_LowercaseLogins : MigrationBase("0.47") {

    companion object {
        private val log = LogManager.getLogger()
    }

    @Autowired
    lateinit var entityManager: EntityManager

    @Autowired
    private lateinit var transactionManager: PlatformTransactionManager

    @Autowired
    private lateinit var userRepo: UserRepository

    override fun exec() {
        // do everything in postExec
    }

    override fun postExec() {
        ClosableTransaction(transactionManager).use {
            setAuthentication()

            val allUsers = userRepo.findAll()

            allUsers.forEach { user ->
                try {
                    if (user.userId == user.userId.lowercase()) return@forEach
                    if (allUsers.find { it.userId == user.userId.lowercase() } != null) {
                        log.warn("User ${user.userId} already exists as lowercase version")
                        return@forEach
                    }

                    user.userId = user.userId.lowercase()
                    userRepo.saveAndFlush(user)
                } catch (ex: Exception) {
                    log.error("Error migrating user ${user.userId}", ex)
                }
            }
        }
    }


    private fun setAuthentication() {
        val auth: Authentication =
            UsernamePasswordAuthenticationToken("Scheduler", "Task", listOf(SimpleGrantedAuthority("cat-admin")))
        SecurityContextHolder.getContext().authentication = auth
    }

}
