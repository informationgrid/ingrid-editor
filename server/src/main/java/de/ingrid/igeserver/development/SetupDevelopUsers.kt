package de.ingrid.igeserver.development

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct

@Profile("dev")
@Component
class SetupDevelopUsers @Autowired constructor(
    val userRepo: UserRepository,
    val catalogRepo: CatalogRepository,
    val roleRepo: RoleRepository,
) {
    
    @PostConstruct
    fun init() {
        // delay initialization after all migrations
        Timer("IgeTasks", false).schedule(10000) {
            val userExists = userRepo.findByUserId("userCat") != null
            if (userExists) {
                return@schedule
            }

            createUser("userCat", "cat-admin")
            createUser("userMD", "md-admin")
            createUser("userAuthor", "author")
        }
    } 
    
    private fun createUser(login: String, role: String) {
        val user = UserInfo().apply {
            this.userId = login
            this.role = roleRepo.findByName(role)
        }

        val persistedUser = userRepo.save(user)
        persistedUser.catalogs = mutableSetOf(catalogRepo.findById(1).get())
        userRepo.save(persistedUser)
    }
}