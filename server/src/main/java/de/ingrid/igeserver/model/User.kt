/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.model

import java.util.*

/**
 * User
 */
data class User(
    var login: String,
    var firstName: String = "",
    var lastName: String = "",
    var email: String = "",
    var role: String = "",
    var organisation: String = "",
    var phoneNumber: String = "",
    var department: String = "",
    var groups: List<Int> = emptyList(),
    var creationDate: Date = Date(0),
    var modificationDate: Date = Date(0),
    var latestLogin: Date? = null,
    var id: Int? = null
)
