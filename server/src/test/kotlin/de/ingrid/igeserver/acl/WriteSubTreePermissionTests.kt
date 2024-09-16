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
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.security.authorization.AuthorizationDeniedException
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.transaction.annotation.Transactional

@WithMockUser(username = "test-user", authorities = ["GROUP_WRITESUBTREE"])
class WriteSubTreePermissionTests : IntegrationTest() {

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val rootUuid = "e80b856b-dbea-4f88-99e6-c554bf18480e"
    private val childUuid = "e3b3ba5a-29e0-428e-96b2-20c2b1c92f7d"
    private val childUuidNoParentRead = "b304f85d-b8ff-470c-828c-700f384e3bcd"
    private val subChildUuidNoParentRead = "17cafb6e-3356-4225-8040-a62b11a5a8eb"
    private val excludedUuid = "5d2ff598-45fd-4516-b843-0b1787bd8264"

    @Test
    fun readAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe true
    }

    @Test
    fun readAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun readNotAllowedToDocumentNotInGroup() {
        docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun writeNotAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe true
        docWrapperRepo.save(doc)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun writeNotAllowedToRootDocumentInGroupWithNoParentReadAccess() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuidNoParentRead)
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe true
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToSubDocumentInGroupWithNoParentReadAccess() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", subChildUuidNoParentRead)
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun writeNotAllowedToDocumentNotInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test(expected = AuthorizationDeniedException::class)
    @Transactional
    fun deleteNotAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }

    @Test(expected = EmptyResultDataAccessException::class)
    @Transactional
    fun deleteAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        docWrapperRepo.deleteById(doc.id!!)
        docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
    }

    @Test(expected = AuthorizationDeniedException::class)
    fun deleteNotAllowedToDocumentNotInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }
}
