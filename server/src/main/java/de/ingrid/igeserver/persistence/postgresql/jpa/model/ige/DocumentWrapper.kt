package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import com.fasterxml.jackson.databind.node.ObjectNode
import com.vladmihalcea.hibernate.type.array.ListArrayType
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import de.ingrid.igeserver.services.DocumentService
import org.hibernate.annotations.*
import java.time.OffsetDateTime
import java.util.*
import javax.persistence.*
import javax.persistence.CascadeType
import javax.persistence.Entity
import javax.persistence.Table

@Entity
@Table(name = "document_wrapper")
@TypeDef(
    name = "list-array",
    typeClass = ListArrayType::class
)
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
    var type: String? = null

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

    /**
     * Draft document relation (many-to-one)
     * NOTE Since the JSON representation contains a document id ('draft') only, we need
     * to map it manually to the document instance for persistence
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "draft", nullable = true)
    @JsonAlias("draft") // hint for model registry
    @JsonIgnore
    var draft: Document? = null

    @Transient
    @JsonSetter("draft")
    private var draftId: String? = null

    @JsonGetter("draft")
    fun getDraftId(): String? {
        if (this.draftId == null) {
            this.draftId = draft?.id?.toString()
        }
        return this.draftId
    }

    /**
     * Published document relation (many-to-one)
     * NOTE Since the JSON representation contains a document id ('published') only, we need
     * to map it manually to the document instance for persistence
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "published", nullable = true)
    @JsonAlias("published") // hint for model registry
    @JsonIgnore
    var published: Document? = null

    @Transient
    @JsonSetter("published")
    private var publishedId: String? = null

    @JsonGetter("published")
    fun getPublishedId(): String? {
        if (this.publishedId == null) {
            this.publishedId = published?.id?.toString()
        }
        return this.publishedId
    }

    /**
     * Archive document relation (many-to-many)
     * NOTE Since the JSON representation contains document ids ('archive') only, we need
     * to map them manually to document instances for persistence
     */
    @ManyToMany(cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    @JoinTable(
        name = "document_archive",
        joinColumns = [JoinColumn(name = "wrapper_id")],
        inverseJoinColumns = [JoinColumn(name = "document_id")]
    )
    @JsonAlias("archive") // hint for model registry
    @JsonIgnore
    var archive: MutableSet<Document> = LinkedHashSet<Document>()

    @Transient
    @JsonSetter("archive")
    private var archiveIds: Array<String>? = null

    @JsonGetter("archive")
    fun getArchiveIds(): Array<String> {
        if (this.archiveIds == null) {
            this.archiveIds = archive.map { it.id.toString() }.toTypedArray()
        }
        return this.archiveIds!!
    }

    @Type(type = "list-array")
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


    /**
     * Draft document relation (many-to-one)
     * NOTE Since the JSON representation contains a document id ('draft') only, we need
     * to map it manually to the document instance for persistence
     */
    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "pending", nullable = true)
    @JsonAlias("pending") // hint for model registry
    @JsonIgnore
    var pending: Document? = null

    @Column
    @JsonSerialize(using = DateSerializer::class)
    @JsonDeserialize(using = DateDeserializer::class)
    @JsonProperty("pending_date")
    var pending_date: OffsetDateTime? = null

    @Transient
    fun getState(): String {
        val hasDraft = draft != null
        val hasPublished = published != null
        return if (hasPublished && hasDraft) {
            DocumentService.DocumentState.PUBLISHED.value + DocumentService.DocumentState.DRAFT.value
        } else if (hasPublished) {
            DocumentService.DocumentState.PUBLISHED.value
        } else {
            DocumentService.DocumentState.DRAFT.value
        }
    }

    @Transient
    var hasWritePermission: Boolean = true

    @Transient
    var hasOnlySubtreeWritePermission: Boolean = false
}
