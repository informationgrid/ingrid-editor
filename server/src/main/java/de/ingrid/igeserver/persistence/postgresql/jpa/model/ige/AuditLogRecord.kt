package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import de.ingrid.igeserver.persistence.postgresql.model.meta.AuditLogRecordData
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import javax.persistence.*

@Entity
@Table(name = "audit_log")
@TypeDef(name = "jsonb", typeClass = JsonBinaryType::class)
class AuditLogRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @Type(type = "jsonb")
    @Column(name = "message", columnDefinition = "jsonb")
    var data: AuditLogRecordData? = null

    @Column
    var file: String? = null

    @Column(name = "class")
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