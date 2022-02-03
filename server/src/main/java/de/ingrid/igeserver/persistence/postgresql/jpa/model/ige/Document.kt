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
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
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
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalog: Catalog? = null

    /**
     * This is used as information during indexing, where we don't want to request database for each document
     * we want to index. This can be removed, if we use the catalog id instead or database id of the document.
     * Since references in profiles are stored as uuids we need the catalog id(entifier)!
     */
    @Transient
    @JsonIgnore
    var catalogIdentifier: String? = null

    @Column(nullable = false)
    @JsonProperty("_uuid")
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

    @PreUpdate
    fun setUpdateDate() {
        modified = dateService?.now()
    }

    @Column
    @JsonProperty("_createdBy")
    var createdby: String? = null

    @Column
    @JsonProperty("_modifiedBy")
    var modifiedby: String? = null

    @Transient
    @JsonProperty("_state")
    var state: String? = null

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
