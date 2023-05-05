package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.vladmihalcea.hibernate.type.json.JsonType
import de.ingrid.igeserver.persistence.postgresql.model.meta.AuditLogRecordData
import jakarta.persistence.*
import org.hibernate.annotations.Type

@Entity
@Table(name = "audit_log")
class AuditLogRecord {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @Column(nullable = false)
    @JsonProperty("_type")
    var type: String? = null

    @Type(JsonType::class)
    @Column(name = "message", columnDefinition = "jsonb")
    var message: AuditLogRecordData? = null

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