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
package de.ingrid.igeserver.acl

import IntegrationTest
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.security.test.context.support.WithMockUser

@WithMockUser(username = "test-user", authorities = ["GROUP_READTREE"])
class ReadPermissionTests : IntegrationTest() {

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val rootUuid = "5d2ff598-45fd-4516-b843-0b1787bd8264"
    private val childUuid = "8f891e4e-161e-4d2c-6869-03f02ab352dc"
    private val rootUuidNoParentRead = "7289c68d-f036-4d61-932c-855ac408bde1"
    private val childUuidNoParentRead = "5c065bb7-ec46-4cab-bb02-8de2a814230b"
    private val excludedUuid = "c689240d-e7a9-45cc-b761-44eda0cda1f1"

    @Test
    fun readAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    /**
     * Read document which is a child of another document we set the group permission to
     */
    @Test
    fun readAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    @Test
    fun readAllowedToDocumentInGroupButNoReadToParent() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuidNoParentRead)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    @Test
    fun readAllowedToSubDocumentInGroupButNoReadToParent() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuidNoParentRead)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun readNotAllowedToDocumentNotInGroup() {
        docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun writeNotAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun writeNotAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun deleteNotAllowedToDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun deleteNotAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun deleteNotAllowedToDocumentNotInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }
}
