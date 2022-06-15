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
class ReadRootPermissionTests : AnnotationSpec() {

    override fun extensions() = listOf(SpringExtension)

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val GROUP_READ_ROOT_PERMISSION: String = "SPECIAL_read_root"

    private val rootUuid = "e80b856b-dbea-4f88-99e6-c554bf18480e"
    private val childUuid = "e3b3ba5a-29e0-428e-96b2-20c2b1c92f7d"

    @BeforeEach
    fun beforeEach() {
        mockUser(GROUP_READ_ROOT_PERMISSION)
    }

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


    private fun mockUser(group: String = "GROUP_NULL") {
        SecurityContextHolder.getContext().authentication =
            PreAuthenticatedAuthenticationToken(
                BasicUserPrincipal("meier"),
                null,
                listOf(SimpleGrantedAuthority(group))
            )
    }
}
