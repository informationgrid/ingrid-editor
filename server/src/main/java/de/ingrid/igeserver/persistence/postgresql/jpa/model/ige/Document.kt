package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import org.hibernate.annotations.Type
import java.time.OffsetDateTime
import java.util.*
import javax.persistence.*

@Entity
@Table(name = "document")
class Document {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @JsonIgnore
    var catalog: Catalog? = null

    @Column(nullable = false)
    @JsonProperty("_id")
    var uuid: String = UUID.randomUUID().toString()

    @Column(nullable=false)
    @JsonProperty("_type")
    var type: String? = null

    @Column(nullable = false)
    var title: String? = null

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    lateinit var data: ObjectNode

    @ManyToMany(mappedBy = "archive", fetch = FetchType.LAZY)
    @JsonIgnore
    var archiveWrapper: MutableSet<DocumentWrapper> = LinkedHashSet<DocumentWrapper>()

    @Version
    @JsonProperty("db_version")
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
        created = dateService?.now()
        modified = created
    }

    @PreUpdate
    fun setUpdateDate() {
        modified = dateService?.now()
    }

    @Transient
    @JsonProperty("_state")
    var state: String? = null

    companion object {
        private val dateService: DateService? by lazy {
            SpringContext.getBean(DateService::class.java)
        }
    }
}