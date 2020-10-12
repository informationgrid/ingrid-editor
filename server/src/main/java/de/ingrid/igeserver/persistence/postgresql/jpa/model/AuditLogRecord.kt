package de.ingrid.igeserver.persistence.postgresql.jpa.model

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
import org.hibernate.annotations.Type
import javax.persistence.*

@NoArgs
@Entity
@Table(name="audit_log")
class AuditLogRecord(

        @Type(type="jsonb")
        @Column(columnDefinition="jsonb")
        @Basic(fetch=FetchType.LAZY)
        val data: JsonNode

) : EntityBase()