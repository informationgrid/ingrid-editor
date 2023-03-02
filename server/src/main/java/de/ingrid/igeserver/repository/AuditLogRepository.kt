package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.AuditLogRecord
import org.springframework.data.jpa.repository.JpaRepository

interface AuditLogRepository : JpaRepository<AuditLogRecord, Int> {
    
    fun findAllByLogger(logger: String): List<AuditLogRecord>
}