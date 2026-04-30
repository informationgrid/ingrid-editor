package de.ingrid.igeserver.utils

import org.junit.jupiter.api.Assertions.assertEquals
import org.junit.jupiter.api.Assertions.assertNull
import org.junit.jupiter.api.Test
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken
import org.springframework.security.core.context.SecurityContextHolder

class SecurityUtilsTest {

    @Test
    fun `runAsAdmin restores original authentication`() {
        // Prepare
        val originalAuth = UsernamePasswordAuthenticationToken("user", "pass")
        SecurityContextHolder.getContext().authentication = originalAuth

        // Execute
        runAsAdmin("Admin", "Secret") { currentAuth ->
            assertEquals("Admin", currentAuth.name)
            assertEquals(currentAuth, SecurityContextHolder.getContext().authentication)
        }

        // Verify
        assertEquals(originalAuth, SecurityContextHolder.getContext().authentication)

        // Cleanup
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `runAsAdmin restores original authentication even on error`() {
        // Prepare
        val originalAuth = UsernamePasswordAuthenticationToken("user", "pass")
        SecurityContextHolder.getContext().authentication = originalAuth

        // Execute & Verify error
        try {
            runAsAdmin {
                throw RuntimeException("Expected error")
            }
        } catch (e: RuntimeException) {
            assertEquals("Expected error", e.message)
        }

        // Verify restoration
        assertEquals(originalAuth, SecurityContextHolder.getContext().authentication)

        // Cleanup
        SecurityContextHolder.clearContext()
    }

    @Test
    fun `runAsAdmin works when no original authentication exists`() {
        // Prepare
        SecurityContextHolder.clearContext()

        // Execute
        runAsAdmin { currentAuth ->
            assertEquals("Scheduler", currentAuth.name)
            assertEquals(currentAuth, SecurityContextHolder.getContext().authentication)
        }

        // Verify
        assertNull(SecurityContextHolder.getContext().authentication)
    }
}
