package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.DefaultEntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.model.meta.AuditLogRecordData
import org.hibernate.annotations.Type
import javax.persistence.*

@NoArgs
@Entity
@Table(name="audit_log")
class AuditLogRecord(

    @Type(type="embeddedData")
    @Column(name="message", columnDefinition="jsonb")
    override var data: AuditLogRecordData?

) : DefaultEntityWithEmbeddedData<AuditLogRecordData>() {

    @Column(nullable=false)
    @field:JsonProperty("_type")
    override var type: String? = data?.typeColumnValue

    @Column
    val file: String? = null

    @Column(name="class")
    @field:JsonProperty("class")
    val clazz: String? = null

    @Column
    val method: String? = null

    @Column
    val line: String? = null

    @Column
    val logger: String? = null

    @Column
    val thread: String? = null

    @Column
    val level: String? = null

    @Column
    val timestamp: String? = null
}