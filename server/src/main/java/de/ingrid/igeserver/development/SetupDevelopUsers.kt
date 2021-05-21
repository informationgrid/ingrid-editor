package de.ingrid.igeserver.development

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.stereotype.Component
import javax.annotation.PostConstruct

@Component
class SetupDevelopUsers @Autowired constructor(
    val userRepo: UserRepository,
    val catalogRepo: CatalogRepository,
    val roleRepo: RoleRepository,
) {
    
    @PostConstruct
    fun init() {
        val userExists = userRepo.findByUserId("userCat") != null
        if (userExists) {
            return
        }
        
        createUser("userCat", "cat-admin")
        createUser("userMD", "md-admin")
        createUser("userAuthor", "author")
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