/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.jpa.repository.Modifying
import org.springframework.data.jpa.repository.Query

@Suppress("ktlint:standard:function-naming")
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
