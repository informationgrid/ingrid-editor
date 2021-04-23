package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import org.springframework.cache.annotation.Cacheable
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Query

interface UserRepository : JpaRepository<UserInfo, Int> {
    // TODO: implement caching
    @Cacheable(value = ["user"])
    fun findByUserId(userId: String): UserInfo
    
    // TODO: implement
    @Query("SELECT u FROM UserInfo u")
    fun findAllByCatalogId(catalogId: String): List<UserInfo>
    
    fun deleteByUserId(userId: String)
}