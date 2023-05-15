package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import de.ingrid.igeserver.services.DOCUMENT_STATE
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.type.SqlTypes
import java.time.OffsetDateTime
import java.util.*

@Entity
@Table(name = "document")
class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalog: Catalog? = null

    @Column(nullable = false)
    @JsonProperty("_uuid")
    var uuid: String = UUID.randomUUID().toString()

    @Column(nullable = false)
    @JsonProperty("_type")
    lateinit var type: String

    @Column(nullable = false)
    var title: String? = null

    @JdbcTypeCode(SqlTypes.JSON)
    lateinit var data: ObjectNode

    @Version
    @JsonProperty("_version")
    var version: Int? = null

    @Column
    @JsonSerialize(using = DateSerializer::class)
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_created")
    var created: OffsetDateTime? = null

    @Column
    @JsonSerialize(using = DateSerializer::class)
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("_modified")
    var modified: OffsetDateTime? = null

    @PrePersist
    fun setPersistDate() {
        modified = dateService?.now()
    }

    @Column
    @JsonProperty("_createdBy")
    var createdby: String? = null

    @Column
    @JsonProperty("_modifiedBy")
    var modifiedby: String? = null


    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "createdbyuser", nullable = true)
    @JsonIgnore
    var createdByUser: UserInfo? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "modifiedbyuser", nullable = true)
    @JsonIgnore
    var modifiedByUser: UserInfo? = null

    @JsonIgnore
    var isLatest: Boolean = false

    //    @JsonIgnore
    @Convert(converter = StateEnumConverter::class)
    @JsonProperty("_state")
    lateinit var state: DOCUMENT_STATE

    companion object {
        private val dateService: DateService? by lazy {
            SpringContext.getBean(DateService::class.java)
        }
    }

    @Transient
    var hasWritePermission: Boolean = true

    @Transient
    var hasOnlySubtreeWritePermission: Boolean = false

    @Transient
    @JsonProperty("_id")
    var wrapperId: Int? = null
}

class StateEnumConverter : AttributeConverter<DOCUMENT_STATE, String> {
    override fun convertToDatabaseColumn(attribute: DOCUMENT_STATE): String = attribute.name

    override fun convertToEntityAttribute(dbData: String): DOCUMENT_STATE = DOCUMENT_STATE.valueOf(dbData)

}
