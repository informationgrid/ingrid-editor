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
package de.ingrid.igeserver.model

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Behaviour
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
import java.util.*

data class UserInfo(
    val id: Int? = null,
    val login: String? = null,
    val name: String,
    val firstName: String,
    val lastName: String,
    val email: String,
    val assignedCatalogs: List<Catalog>,
    val role: String?,
    val groups: Set<String>?,
    val currentCatalog: Catalog?,
    val version: Version,
    val lastLogin: Date?,
    val externalHelp: String?,
    val useElasticsearch: Boolean?,
    val permissions: List<String>,
    var parentProfile: String? = null,
    val plugins: List<Behaviour> = emptyList()
)

data class Version(val version: String?, val date: Date?, val commitId: String?)
