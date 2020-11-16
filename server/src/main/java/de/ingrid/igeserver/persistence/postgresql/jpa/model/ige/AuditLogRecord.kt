package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.AbstractEntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.model.meta.AuditLogRecordData
import org.hibernate.annotations.Type
import javax.persistence.*

@NoArgs
@Entity
@Table(name="audit_log")
class AuditLogRecord : AbstractEntityWithEmbeddedData<AuditLogRecordData>() {

    @Type(type="embeddedData")
    @Column(name="message", columnDefinition="jsonb")
    override var data: AuditLogRecordData? = null
        set(value) {
            type = value?.typeColumnValue
            field = value
        }

    @Column(nullable=false)
    @JsonProperty("_type")
    override var type: String? = null

    @Column
    var file: String? = null

    @Column(name="class")
    @JsonProperty("class")
    var clazz: String? = null

    @Column
    var method: String? = null

    @Column
    var line: String? = null

    @Column
    var logger: String? = null

    @Column
    var thread: String? = null

    @Column
    var level: String? = null

    @Column
    var timestamp: String? = null
}