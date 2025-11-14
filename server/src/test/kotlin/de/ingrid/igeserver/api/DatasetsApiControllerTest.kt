/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.api

import com.ninjasquad.springmockk.MockkBean
import com.ninjasquad.springmockk.SpykBean
import de.ingrid.igeserver.repository.DocumentRepository
import de.ingrid.igeserver.repository.DocumentWrapperRepository
import de.ingrid.igeserver.services.AuditLogger
import de.ingrid.igeserver.services.CatalogService
import de.ingrid.igeserver.services.DocumentService
import de.ingrid.igeserver.services.GroupService
import de.ingrid.igeserver.services.IgeAclService
import de.ingrid.igeserver.services.ResearchService
import de.ingrid.igeserver.services.checkForRootPermissions
import de.ingrid.igeserver.utils.AuthUtils
import de.ingrid.mdek.upload.storage.Storage
import io.kotest.core.spec.style.AnnotationSpec
import io.mockk.clearAllMocks
import io.mockk.every
import io.mockk.mockk
import io.mockk.mockkStatic
import io.mockk.verify
import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.core.Authentication

class DatasetsApiControllerTest : AnnotationSpec() {

    @SpykBean
    private lateinit var datasetsApiController: DatasetsApiController

    @MockkBean(relaxed = true)
    private lateinit var authUtils: AuthUtils

    @MockkBean(relaxed = true)
    private lateinit var docWrapperRepo: DocumentWrapperRepository

    @MockkBean(relaxed = true)
    private lateinit var docRepo: DocumentRepository

    @MockkBean(relaxed = true)
    private lateinit var groupService: GroupService

    @MockkBean(relaxed = true)
    private lateinit var storage: Storage

    @MockkBean(relaxed = true)
    private lateinit var auditLog: AuditLogger

    @MockkBean(relaxed = true)
    private lateinit var catalogService: CatalogService

    @MockkBean(relaxed = true)
    private lateinit var documentService: DocumentService

    @MockkBean(relaxed = true)
    private lateinit var researchService: ResearchService

    @MockkBean(relaxed = true)
    private lateinit var aclService: IgeAclService

    private val isAddress = false

    @Test
    fun `getChildren without permission checks`() {
        val principal = mockk<Authentication>(relaxed = true)

        // ADMINS
        every { authUtils.isAdmin(principal) } returns true

        // admin, root-children
        datasetsApiController.getChildren(principal, null, isAddress)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        // admin, sub-children
        datasetsApiController.getChildren(principal, "1", isAddress)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        // admin, sub-children, ignoreRootRead permission
        datasetsApiController.getChildren(principal, "1", isAddress, true)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        // NON-ADMINS
        every { authUtils.isAdmin(principal) } returns false

        // non-admin, sub-children
        datasetsApiController.getChildren(principal, "1", isAddress)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        mockkStatic("de.ingrid.igeserver.services.IgeAclServiceKt")
        every { checkForRootPermissions(any(), listOf(BasePermission.WRITE)) } returns true
        // non-admin, root-children, ignore root tree permission when user has no root permission
        datasetsApiController.getChildren(principal, null, isAddress, true)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        // non-admin, root-children, has root-write permission
        every { checkForRootPermissions(any(), listOf(BasePermission.WRITE)) } returns true
        datasetsApiController.getChildren(principal, null, isAddress)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        // non-admin, root-children, has root-read permission
        every { checkForRootPermissions(any(), listOf(BasePermission.READ)) } returns true
        datasetsApiController.getChildren(principal, null, isAddress)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        // non-admin, root-children, has root-read permission and ignoreRootReadPermission
        every { checkForRootPermissions(any(), listOf(BasePermission.READ)) } returns true
        datasetsApiController.getChildren(principal, null, isAddress, true)
        shouldRequestChildrenWithPermissionCheck()
    }

    @Test
    fun `getChildren with permission checks`() {
        val principal = mockk<Authentication>(relaxed = true)

        every { authUtils.isAdmin(principal) } returns false

        // non-admin, root-children
        datasetsApiController.getChildren(principal, null, isAddress)
        shouldRequestChildrenWithPermissionCheck()
        clearAllMocks()

        // non-admin, sub-children, ignoreRootReadPermission
        datasetsApiController.getChildren(principal, "1", isAddress, true)
        shouldRequestChildrenWithoutPermissionCheck()
        clearAllMocks()

        mockkStatic("de.ingrid.igeserver.services.IgeAclServiceKt")

        // non-admin, root-children, ignore root-tree permission when user has no root permission
        datasetsApiController.getChildren(principal, null, isAddress, true)
        shouldRequestChildrenWithPermissionCheck()
        clearAllMocks()

        // non-admin, root-children, has root-read permission and ignoreRootReadPermission
        every { checkForRootPermissions(any(), listOf(BasePermission.READ)) } returns true
        datasetsApiController.getChildren(principal, null, isAddress, true)
        shouldRequestChildrenWithPermissionCheck()
    }

    private fun shouldRequestChildrenWithoutPermissionCheck() {
        verify(exactly = 1) { documentService.findChildren(any(), any(), any()) }
        verify(exactly = 0) { aclService.getDatasetIdsSetInGroups(any(), any(), any()) }
    }

    private fun shouldRequestChildrenWithPermissionCheck() {
        verify(exactly = 0) { documentService.findChildren(any(), any(), any()) }
        verify(exactly = 1) { aclService.getDatasetIdsSetInGroups(any(), any(), any()) }
    }
}
