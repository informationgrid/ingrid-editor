package de.ingrid.igeserver.acl

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.repository.DocumentWrapperRepository
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
@Sql(scripts = ["/test_data_acl.sql"], config = SqlConfig(encoding = "UTF-8"))
class WriteSubTreePermissionTests : AnnotationSpec() {

    override fun listeners() = listOf(SpringListener)

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val GROUP_WRITE_SUBTREE_PERMISSION: String = "GROUP_WRITESUBTREE"

    private val rootUuid = "e80b856b-dbea-4f88-99e6-c554bf18480e"
    private val childUuid = "e3b3ba5a-29e0-428e-96b2-20c2b1c92f7d"
    private val childUuidNoParentRead = "b304f85d-b8ff-470c-828c-700f384e3bcd"
    private val subChildUuidNoParentRead = "17cafb6e-3356-4225-8040-a62b11a5a8eb"
    private val excludedUuid = "5d2ff598-45fd-4516-b843-0b1787bd8264"

    @BeforeEach
    fun beforeEach() {
        mockUser(GROUP_WRITE_SUBTREE_PERMISSION)
    }

    @Test
    fun readAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findById(rootUuid)
        assertNotNull(doc)
        assertFalse(doc.hasWritePermission)
        assertTrue(doc.hasOnlySubtreeWritePermission)
    }

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

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findById(rootUuid)
        assertFalse(doc.hasWritePermission)
        assertTrue(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToRootDocumentInGroupWithNoParentReadAccess() {
        val doc = docWrapperRepo.findById(childUuidNoParentRead)
        assertFalse(doc.hasWritePermission)
        assertTrue(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findById(childUuid)
        assertTrue(doc.hasWritePermission)
        assertFalse(doc.hasOnlySubtreeWritePermission)
        docWrapperRepo.save(doc)
    }

    @Test
    fun writeAllowedToSubDocumentInGroupWithNoParentReadAccess() {
        val doc = docWrapperRepo.findById(subChildUuidNoParentRead)
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

    @Test(expected = AccessDeniedException::class)
    @Transactional
    fun deleteNotAllowedToRootDocumentInGroup() {
        docWrapperRepo.deleteById(rootUuid)
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