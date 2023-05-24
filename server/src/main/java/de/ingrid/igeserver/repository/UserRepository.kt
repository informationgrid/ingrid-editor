package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

interface UserRepository : JpaRepository<UserInfo, Int> {
    // TODO: implement caching
//    @Cacheable(value = ["user"])
    fun findByUserId(userId: String): UserInfo?

    @Query("SELECT u.userId FROM UserInfo u")
    fun getAllUserIds(): List<String>

    @Query("SELECT u FROM UserInfo u INNER JOIN u.catalogs cat WHERE cat.identifier=?1")
    fun findAllByCatalogId(catalogId: String): List<UserInfo>

    @Query("SELECT u.userId FROM UserInfo u INNER JOIN u.catalogs cat WHERE cat.identifier=?1")
    fun findAllUserIdsByCatalogId(catalogId: String): List<String>

    fun findByGroups_Id(groups_id: Int): List<UserInfo>

    @Modifying
    @Query("DELETE FROM UserInfo u WHERE u.userId=?1")
    fun deleteByUserId(userId: String)
}
