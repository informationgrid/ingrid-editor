package de.ingrid.igeserver.acl

import de.ingrid.igeserver.IgeServer
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import io.kotest.core.spec.style.AnnotationSpec
import io.kotest.spring.SpringListener
import org.apache.http.auth.BasicUserPrincipal
import org.junit.jupiter.api.Assertions.assertNotNull
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


@SpringBootTest(classes = [IgeServer::class])
@TestPropertySource(locations = ["classpath:application-test.properties"])
@AutoConfigureTestDatabase(replace = AutoConfigureTestDatabase.Replace.NONE)
@Sql(scripts=["/test_data_acl.sql"], config= SqlConfig(encoding="UTF-8"))
class MoreAdminTests: AnnotationSpec() {

    override fun listeners() = listOf(SpringListener)

    @Autowired
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    private val GROUP_READ_PERMISSION: String = "GROUP_READTREE"

    @Test
    fun readDocumentAllowed() {
        mockUser(GROUP_READ_PERMISSION)
        assertNotNull(docWrapperRepo.findById("5d2ff598-45fd-4516-b843-0b1787bd8264"))
    }

    /**
     * Read document which is a child of another document we set the group permission to
     */
    @Test
    fun readSubDocumentAllowed() {
        mockUser(GROUP_READ_PERMISSION)
        assertNotNull(docWrapperRepo.findById("8f891e4e-161e-4d2c-6869-03f02ab352dc"))
    }

    @Test(expected = AccessDeniedException::class)
    fun readDocumentWithNoPermission() {
        mockUser()
        docWrapperRepo.findById("5d2ff598-45fd-4516-b843-0b1787bd8264")
    }

    @Test(expected = AccessDeniedException::class)
    fun readDocumentNotInGroup() {
        mockUser(GROUP_READ_PERMISSION)
        docWrapperRepo.findById("d7cee1a0-5326-44d8-a840-a5f7bde43ab9")
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