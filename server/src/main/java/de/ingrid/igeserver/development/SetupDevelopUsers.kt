package de.ingrid.igeserver.development

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfoData
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.RoleRepository
import de.ingrid.igeserver.repository.UserRepository
import jakarta.annotation.PostConstruct
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Profile
import org.springframework.stereotype.Component
import java.util.*
import kotlin.concurrent.schedule

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
        Timer("IgeTasks", false).schedule(5000) {
            val userExists = userRepo.findByUserId("userCat") != null
            if (userExists) {
                return@schedule
            }

            if (catalogRepo.count() < 1) {
                val catalog = Catalog().apply {
                    this.id = 1
                    this.name = "Testkatalog"
                    this.identifier = "testkatalog"
                    this.type = "mcloud"
                }
                catalogRepo.save(catalog)
            }

            createUser("userCat", "ige-super-admin")
            createUser("userMD", "md-admin")
            createUser("userAuthor", "author")
        }
    }

    private fun createUser(login: String, role: String) {
        val user = UserInfo().apply {
            this.userId = login
            this.role = roleRepo.findByName(role)
            this.data = UserInfoData().apply {
                this.creationDate = Date()
                this.modificationDate = Date()
            }
        }

        val persistedUser = userRepo.save(user)
        val kat1 = catalogRepo.findById(1).get()
        persistedUser.catalogs = mutableSetOf(kat1)
        persistedUser.curCatalog = kat1;
        userRepo.save(persistedUser)
    }
}
