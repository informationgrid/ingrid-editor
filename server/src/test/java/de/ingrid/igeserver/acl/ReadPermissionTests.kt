package de.ingrid.igeserver.acl

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.api.DatasetsApiController
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.apache.http.auth.BasicUserPrincipal
import org.junit.jupiter.api.Assertions.assertNotNull
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.jdbc.AutoConfigureTestDatabase
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest
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
@Sql(scripts=["/test_data_acl.sql"], config= SqlConfig(encoding="UTF-8"))
class ReadPermissionTests: AnnotationSpec() {

    override fun listeners() = listOf(SpringListener)

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val GROUP_READ_PERMISSION: String = "GROUP_READTREE"

    private val rootUuid = "5d2ff598-45fd-4516-b843-0b1787bd8264"
    private val childUuid = "8f891e4e-161e-4d2c-6869-03f02ab352dc"
    private val excludedUuid = "d7cee1a0-5326-44d8-a840-a5f7bde43ab9"


    @BeforeEach
    fun beforeEach() {
        mockUser(GROUP_READ_PERMISSION)
    }
    
    @Test
    fun readAllowedToRootDocumentInGroup() {
        assertNotNull(docWrapperRepo.findById(rootUuid))
    }

    /**
     * Read document which is a child of another document we set the group permission to
     */
    @Test
    fun readAllowedToSubDocumentInGroup() {
        assertNotNull(docWrapperRepo.findById(childUuid))
    }

    @Test(expected = AccessDeniedException::class)
    fun readNotAllowedToDocumentNotInGroup() {
        docWrapperRepo.findById(excludedUuid)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToRootDocumentInGroup() {
        val doc = docWrapperRepo.findById(rootUuid)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToSubDocumentInGroup() {
        val doc = docWrapperRepo.findById(childUuid)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun writeNotAllowedToDocumentNotInGroup() {
        val doc = docWrapperRepo.findById(excludedUuid)
        docWrapperRepo.save(doc)
    }

    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToDocumentInGroup() {
        docWrapperRepo.deleteById(rootUuid)
    }

    @Test(expected = AccessDeniedException::class)
    fun deleteNotAllowedToSubDocumentInGroup() {
        docWrapperRepo.deleteById(childUuid)
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