package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import org.springframework.data.jpa.repository.JpaRepository

interface UserRepository : JpaRepository<UserInfo, Int> {
    // TODO: implement caching
    //    @Cacheable
    fun findByUserId(userId: String): UserInfo
}