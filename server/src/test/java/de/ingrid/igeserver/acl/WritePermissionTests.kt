package de.ingrid.igeserver.acl

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.GroupService
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.apache.http.auth.BasicUserPrincipal
import org.junit.jupiter.api.Assertions.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.dao.EmptyResultDataAccessException
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig
import org.springframework.transaction.annotation.Transactional


@SpringBootTest(classes = [IgeServer::class], webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts=["/test_data_acl.sql"], config= SqlConfig(encoding="UTF-8"))
class WritePermissionTests: AnnotationSpec() {

    override fun listeners() = listOf(SpringListener)

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
        val doc = docWrapperRepo.findById(rootUuid)
        assertNotNull(doc)
        assertTrue(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
    }

    /**
     * Read document which is a child of another document we set the group permission to
     */
    @Test
    fun readAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findById(childUuid)
        assertNotNull(doc)
        assertTrue(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
    }

    @Test(expected = AccessDeniedException::class)
    fun readNotAllowedToDocumentNotInGroup() {
        docWrapperRepo.findById(excludedUuid)
    }

    @Test
    fun writeAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findById(rootUuid)
        assertTrue(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findById(childUuid)
        assertTrue(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToDocumentNotInGroup() {
        val doc = docWrapperRepo.findById(excludedUuid)
        assertFalse(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToDocumentInGroupButNoReadToParent() {
        val doc = docWrapperRepo.findById(childUuidNoParentRead)
        assertTrue(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }
    
    @Test
    fun writeAllowedToSubDocumentInGroupButNoReadToParent() {
        val doc = docWrapperRepo.findById(subChildUuidNoParentRead)
        assertTrue(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }
    
    @Test(expected = EmptyResultDataAccessException::class)
    @Transactional
    fun deleteAllowedToDocumentInGroup() {
        docWrapperRepo.deleteById(rootUuid)
        groupService.removeDocFromGroups("test_catalog", rootUuid)

        docWrapperRepo.findById(rootUuid)
    }

    @Test(expected = EmptyResultDataAccessException::class)
    @Transactional
    fun deleteAllowedToSubDocumentInGroup() {
        docWrapperRepo.deleteById(childUuid)
        docWrapperRepo.findById(childUuid)
    }

    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToDocumentNotInGroup() {
        docWrapperRepo.deleteById(excludedUuid)
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