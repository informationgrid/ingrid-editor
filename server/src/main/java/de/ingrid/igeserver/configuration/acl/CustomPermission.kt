/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.configuration.acl

import org.springframework.security.acls.domain.BasePermission
import org.springframework.security.acls.model.Permission

class CustomPermission : BasePermission {
    protected constructor(mask: Int) : super(mask)
    protected constructor(mask: Int, code: Char) : super(mask, code)

    companion object {
        @JvmField val WRITE_ONLY_SUBTREE: Permission = CustomPermission(1 shl 5, 'S')
    }
}
