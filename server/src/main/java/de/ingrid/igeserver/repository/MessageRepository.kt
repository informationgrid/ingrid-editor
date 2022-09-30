package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Message
import org.springframework.data.jpa.repository.JpaRepository
import org.springframework.data.repository.query.Param
import org.springframework.security.access.prepost.PreAuthorize

interface MessageRepository : JpaRepository<Message, Int> {

    fun findAllByCatalog_Identifier(catalog_identifier: String?): List<Message>


    @PreAuthorize("#message.catalog != null || (#message.catalog == null && hasAuthority('ROLE_ige-super-admin'))")
    fun save(@Param("message") message: Message): Message

    @PreAuthorize("#message.catalog != null || (#message.catalog == null && hasAuthority('ROLE_ige-super-admin'))")
    override fun delete(@Param("message") message: Message)
}
