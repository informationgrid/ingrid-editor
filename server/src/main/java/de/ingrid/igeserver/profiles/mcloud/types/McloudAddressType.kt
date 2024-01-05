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
package de.ingrid.igeserver.profiles.mcloud.types

import de.ingrid.igeserver.persistence.model.document.impl.AddressType
import de.ingrid.igeserver.services.DocumentCategory
import org.springframework.jdbc.core.JdbcTemplate
import org.springframework.stereotype.Component

@Component
class McloudAddressType(jdbcTemplate: JdbcTemplate) : AddressType(jdbcTemplate) {

    override val jsonSchema = "/mcloud/schemes/address.schema.json"

    override val category = DocumentCategory.ADDRESS.value

    override val profiles = arrayOf("mcloud")

    override val className = "McloudAddressDoc"
}
