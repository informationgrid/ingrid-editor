package de.ingrid.igeserver.acl

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.apache.http.auth.BasicUserPrincipal
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.security.access.AccessDeniedException
import org.springframework.security.core.authority.SimpleGrantedAuthority
import org.springframework.security.core.context.SecurityContextHolder
import org.springframework.security.web.authentication.preauth.PreAuthenticatedAuthenticationToken
import org.springframework.test.context.TestPropertySource
import org.springframework.test.context.jdbc.Sql
import org.springframework.test.context.jdbc.SqlConfig


@SpringBootTest(classes = [IgeServer::class], webEnvironment = SpringBootTest.WebEnvironment.MOCK)
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts = ["/test_data_acl.sql"], config = SqlConfig(encoding = "UTF-8"))
class ReadPermissionTests : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val GROUP_READ_PERMISSION: String = "GROUP_READTREE"

    private val rootUuid = "5d2ff598-45fd-4516-b843-0b1787bd8264"
    private val childUuid = "8f891e4e-161e-4d2c-6869-03f02ab352dc"
    private val rootUuidNoParentRead = "7289c68d-f036-4d61-932c-855ac408bde1"
    private val childUuidNoParentRead = "5c065bb7-ec46-4cab-bb02-8de2a814230b"
    private val excludedUuid = "c689240d-e7a9-45cc-b761-44eda0cda1f1"


    @BeforeEach
    fun beforeEach() {
        mockUser(GROUP_READ_PERMISSION)
    }

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

    @Test(expected = AccessDeniedException::class)
    fun readNotAllowedToDocumentNotInGroup() {
        docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", excludedUuid)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", rootUuid)
        docWrapperRepo.deleteById(doc.id!!)
    }

    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findByCatalog_IdentifierAndUuid("test_catalog", childUuid)
        docWrapperRepo.deleteById(doc.id!!)
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
