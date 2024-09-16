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
package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Message
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PreAuthorize

@Suppress("ktlint:standard:function-naming")
interface MessageRepository : JpaRepository<Message, Int> {

    fun findAllByCatalog_Identifier(catalog_identifier: String?): List<Message>

    @PreAuthorize("#message.catalog != null || (#message.catalog == null && hasAuthority('ROLE_ige-super-admin'))")
    fun save(@Param("message") message: Message): Message

    @PreAuthorize("#message.catalog != null || (#message.catalog == null && hasAuthority('ROLE_ige-super-admin'))")
    override fun delete(@Param("message") message: Message)
}
