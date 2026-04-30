/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
