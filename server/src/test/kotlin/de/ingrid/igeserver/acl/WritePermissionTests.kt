package de.ingrid.igeserver.acl

import IntegrationTest
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.GroupService
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.apache.http.auth.BasicUserPrincipal
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.transaction.annotation.Transactional


class WritePermissionTests : IntegrationTest() {

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    @Autowired
    private lateinit var groupService: GroupService

    private val GROUP_WRITE_PERMISSION: String = "GROUP_WRITETREE"

    private val rootUuid = "c689240d-e7a9-45cc-b761-44eda0cda1f1"
    private val childUuid = "3fae0d5e-087f-4c26-a580-f59e54296b38"
    private val childUuidNoParentRead = "7a97b378-b01c-4da7-88e3-623a092d83c1"
    private val subChildUuidNoParentRead = "0516d6de-9043-4439-a1e6-6b5b9c7bd6d5"
    private val excludedUuid = "5d2ff598-45fd-4516-b843-0b1787bd8264"


    @BeforeEach
    fun beforeEach() {
        mockUser(GROUP_WRITE_PERMISSION)
    }

    @Test
    fun readAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    /**
     * Read document which is a child of another document we set the group permission to
     */
    @Test
    fun readAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        doc shouldNotBe null
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
    }

    @Test(expected = AccessDeniedException::class)
    fun readNotAllowedToDocumentNotInGroup() {
        docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
    }

    @Test
    fun writeAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToDocumentNotInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
        doc.hasWritePermission shouldBe false
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToDocumentInGroupButNoReadToParent() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuidNoParentRead)
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToSubDocumentInGroupButNoReadToParent() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", subChildUuidNoParentRead)
        doc.hasWritePermission shouldBe true
        doc.hasOnlySubtreeWritePermission shouldBe false
        docWrapperRepo.save(doc)
    }

    @Test(expected = EmptyResultDataAccessException::class)
    @Transactional
    fun deleteAllowedToDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        docWrapperRepo.deleteById(doc.id!!)
//        groupService.removeDocFromGroups("test_catalog", rootUuid)

        docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
    }

    @Test(expected = EmptyResultDataAccessException::class)
    @Transactional
    fun deleteAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        docWrapperRepo.deleteById(doc.id!!)
        docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
    }

    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToDocumentNotInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }


    private fun mockUser(group: String = "GROUP_NULL") {
        SecurityContextHolder.getContext().authentication =
            PreAuthenticatedAuthenticationToken(
                BasicUserPrincipal("meier"),
                null,
                listOf(SimpleGrantedAuthority(group))
            )
    }
}
