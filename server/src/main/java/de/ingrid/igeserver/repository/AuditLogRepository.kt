package de.ingrid.igeserver.repository

import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.AuditLogRecord
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.VersionInfo
import org.springframework.data.jpa.repository.JpaRepository

interface AuditLogRepository : JpaRepository<AuditLogRecord, Int> {
    
    fun findAllByLoggerAndData_Target(logger: String, data_target: String): List<AuditLogRecord>
}