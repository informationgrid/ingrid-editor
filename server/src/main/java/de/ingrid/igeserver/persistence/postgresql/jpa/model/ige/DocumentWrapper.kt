package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import io.hypersistence.utils.hibernate.type.array.ListArrayType
import jakarta.persistence.*
import jakarta.persistence.Table
import org.hibernate.annotations.*
import java.time.OffsetDateTime
import java.util.*

@Entity
@Table(name = "document_wrapper")
@Where(clause = "deleted = 0")
class DocumentWrapper {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    var id: Int? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalog: Catalog? = null

    // must be named "id" since getId() method is used for ACL permissions!
    @Column(name = "uuid", nullable = false)
    var uuid: String = UUID.randomUUID().toString()

    @Column(nullable = false)
    @JsonProperty("_type")
    lateinit var type: String

    @Column(nullable = false)
    @JsonProperty("_category")
    var category: String? = null

    /**
     * Parent relation (many-to-one)
     * NOTE Since the JSON representation contains a document wrapper uuid ('parent') only, we need
     * to map it manually to the document wrapper instance for persistence
     */
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "parent_id", nullable = true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonAlias("_parent") // hint for model registry
    @JsonIgnore
    var parent: DocumentWrapper? = null

    @Transient
    @JsonSetter("_parent")
    private var parentUuid: String? = null

    /*    @JsonIgnore
        private var parentId: Int? = null*/

    @JsonGetter("_parent")
    fun getParentUuid(): String? {
        if (this.parentUuid == null) {
            this.parentUuid = parent?.uuid
        }
        return this.parentUuid
    }

    @Type(ListArrayType::class)
    @Column(
        name = "path",
        columnDefinition = "text[]"
    )
    var path: List<String> = emptyList()
        get() = if (field == null) emptyList() else field // field can actually be null if in db table null


    @Formula(value = "(select count(dw.id) from document_wrapper dw where dw.parent_id = id and dw.deleted = 0)")
    var countChildren: Int = 0

    @Column(name = "deleted")
    var deleted = 0

    @Type(ListArrayType::class)
    @Column(name = "tags", columnDefinition = "text[]")
    var tags: List<String> = emptyList()
        get() = if (field == null) emptyList() else field // field can actually be null if in db table null


    @Column
    @JsonSerialize(using = DateSerializer::class)
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("pending_date")
    var pending_date: OffsetDateTime? = null

    @Transient
    var hasWritePermission: Boolean = true

    @Transient
    var hasOnlySubtreeWritePermission: Boolean = false
}
