/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import IntegrationTest
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Group
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Query
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
import de.ingrid.igeserver.repository.QueryRepository
import de.ingrid.igeserver.repository.UserRepository
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.transaction.annotation.Transactional

@Suppress("ktlint:standard:function-naming")
class CatalogAndGroupDeletionTest : IntegrationTest() {

    @Autowired
    private lateinit var catalogService: CatalogService

    @Autowired
    private lateinit var catalogRepo: CatalogRepository

    @Autowired
    private lateinit var userRepo: UserRepository

    @Autowired
    private lateinit var groupRepo: GroupRepository

    @Autowired
    private lateinit var groupService: GroupService

    @Autowired
    private lateinit var queryRepo: QueryRepository

    @Test
    @Transactional
    fun `deleting a user who is a manager of a group in catalog does not delete the group`() {
        val cat = catalogRepo.save(
            Catalog().apply {
                name = "Catalog With Manager"
                identifier = "cat_mgr_test"
                type = "uvp"
            },
        )

        val managerUser = userRepo.save(
            UserInfo().apply {
                userId = "manager1"
                catalogs = mutableSetOf(cat)
                curCatalog = cat
            },
        )

        val testGroup = Group().apply {
            name = "Managed Group"
            catalog = cat
            manager = managerUser
        }
        groupRepo.save(testGroup)

        catalogService.deleteUser("cat_mgr_test", "manager1")

        // Group should still exist and user should be deleted
        userRepo.findByUserId("manager1") shouldBe null
        groupRepo.findAllByCatalog_Identifier("cat_mgr_test").size shouldBe 1
    }

    @Test
    @Transactional
    fun `deleting a group that has members removes group membership without deleting users`() {
        val cat = catalogRepo.save(
            Catalog().apply {
                name = "Catalog With Members"
                identifier = "cat_member_test"
                type = "uvp"
            },
        )

        val testGroup = groupRepo.save(
            Group().apply {
                name = "Group With Members"
                catalog = cat
            },
        )

        val memberUser = userRepo.save(
            UserInfo().apply {
                userId = "member1"
                catalogs = mutableSetOf(cat)
                curCatalog = cat
                groups = mutableSetOf(testGroup)
            },
        )

        // Delete group
        groupService.remove("cat_member_test", testGroup.id!!)

        // Group is deleted
        groupRepo.findById(testGroup.id!!).isEmpty shouldBe true

        // User still exists
        val reloadedUser = userRepo.findByUserId("member1")
        reloadedUser shouldNotBe null
    }

    @Test
    @Transactional
    fun `deleting a user deletes non-global queries and retains global queries with user set to null`() {
        val cat = catalogRepo.save(
            Catalog().apply {
                name = "Catalog With Queries"
                identifier = "cat_query_test"
                type = "uvp"
            },
        )

        val user = userRepo.save(
            UserInfo().apply {
                userId = "query_owner"
                catalogs = mutableSetOf(cat)
                curCatalog = cat
            },
        )

        val privateQuery = queryRepo.save(
            Query().apply {
                name = "Private Saved Search"
                category = "TEST"
                catalog = cat
                this.user = user
                global = false
                modified = java.time.OffsetDateTime.now()
            },
        )

        val globalQuery = queryRepo.save(
            Query().apply {
                name = "Global Saved Search"
                category = "TEST"
                catalog = cat
                this.user = user
                global = true
                modified = java.time.OffsetDateTime.now()
            },
        )

        catalogService.deleteUser("cat_query_test", "query_owner")

        // User is deleted
        userRepo.findByUserId("query_owner") shouldBe null

        // Non-global query is deleted
        queryRepo.findById(privateQuery.id!!).isEmpty shouldBe true

        // Global query still exists with user = null
        val reloadedGlobalQuery = queryRepo.findById(globalQuery.id!!).orElse(null)
        reloadedGlobalQuery shouldNotBe null
        reloadedGlobalQuery.user shouldBe null
    }

    @Test
    @Transactional
    fun `removing a user from one catalog only deletes non-global queries in that catalog`() {
        val cat1 = catalogRepo.save(
            Catalog().apply {
                name = "Catalog 1"
                identifier = "cat_multi_1"
                type = "uvp"
            },
        )

        val cat2 = catalogRepo.save(
            Catalog().apply {
                name = "Catalog 2"
                identifier = "cat_multi_2"
                type = "uvp"
            },
        )

        val user = userRepo.save(
            UserInfo().apply {
                userId = "multi_cat_user"
                catalogs = mutableSetOf(cat1, cat2)
                curCatalog = cat1
            },
        )

        val queryInCat1 = queryRepo.save(
            Query().apply {
                name = "Cat1 Query"
                category = "TEST"
                catalog = cat1
                this.user = user
                global = false
                modified = java.time.OffsetDateTime.now()
            },
        )

        val queryInCat2 = queryRepo.save(
            Query().apply {
                name = "Cat2 Query"
                category = "TEST"
                catalog = cat2
                this.user = user
                global = false
                modified = java.time.OffsetDateTime.now()
            },
        )

        catalogService.deleteUser("cat_multi_1", "multi_cat_user")

        // User still exists in cat2
        val remainingUser = userRepo.findByUserId("multi_cat_user")
        remainingUser shouldNotBe null

        // Non-global query in cat1 is deleted
        queryRepo.findById(queryInCat1.id!!).isEmpty shouldBe true

        // Non-global query in cat2 still exists
        val remainingQueriesInCat2 = queryRepo.findAllByCatalogAndUser(cat2, remainingUser!!)
        remainingQueriesInCat2.any { it.id == queryInCat2.id } shouldBe true
        queryRepo.findById(queryInCat2.id!!).isPresent shouldBe true
    }

    @Test
    @Transactional
    fun `deleting a catalog deletes its groups but does keep users with other catalogs`() {
        val cat1 = catalogRepo.save(
            Catalog().apply {
                name = "Catalog To Delete"
                identifier = "cat_to_delete"
                type = "uvp"
            },
        )

        val cat2 = catalogRepo.save(
            Catalog().apply {
                name = "Other Catalog"
                identifier = "other_cat"
                type = "uvp"
            },
        )

        val user = userRepo.save(
            UserInfo().apply {
                userId = "user_in_two_cats"
                catalogs = mutableSetOf(cat1, cat2)
                curCatalog = cat1
            },
        )

        val group = Group().apply {
            name = "Group To Delete"
            catalog = cat1
            manager = user
        }
        groupRepo.save(group)

        // Delete the catalog
        catalogService.removeCatalog("cat_to_delete")

        // Catalog is removed
        catalogRepo.existsByIdentifier("cat_to_delete") shouldBe false

        // Group is removed as it belonged to cat1
        groupRepo.findAllByCatalog_Identifier("cat_to_delete").isEmpty() shouldBe true

        // User is NOT deleted
        val remainingUser = userRepo.findByUserId("user_in_two_cats")
        remainingUser shouldNotBe null
        remainingUser!!.catalogs.any { it.identifier == "other_cat" } shouldBe true
        remainingUser.curCatalog?.identifier shouldBe "other_cat"
    }
}
