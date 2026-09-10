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
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.UserInfo
import de.ingrid.igeserver.repository.CatalogRepository
import de.ingrid.igeserver.repository.GroupRepository
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
