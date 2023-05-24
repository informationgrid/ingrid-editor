package de.ingrid.igeserver.acl

import IntegrationTest
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.test.context.support.WithMockUser
import org.springframework.transaction.annotation.Transactional

@WithMockUser(username = "test-user", authorities = ["SPECIAL_read_root"])
class ReadRootPermissionTests : IntegrationTest() {

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val rootUuid = "e80b856b-dbea-4f88-99e6-c554bf18480e"
    private val childUuid = "e3b3ba5a-29e0-428e-96b2-20c2b1c92f7d"

    @Test
    fun readAllowedToRootDocument() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    @Test
    fun readAllowedToSubDocument() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToRootDocument() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToSubDocument() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Transactional
    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToRootDocument() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.deleteById(doc.id!!)
    }

    @Transactional
    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToSubDocument() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }
    
}
