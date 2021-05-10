package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import de.ingrid.igeserver.services.DocumentService
import org.hibernate.annotations.Formula
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import java.util.*
import javax.persistence.*

@Entity
@Table(name="document_wrapper")
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

    @Column(nullable=false)
    @JsonProperty("_id")
    var uuid: String = UUID.randomUUID().toString()

    @Column(nullable=false)
    @JsonProperty("_type")
    var type: String? = null

    @Column(nullable=false)
    @JsonProperty("_category")
    var category: String? = null

    /**
     * Parent relation (many-to-one)
     * NOTE Since the JSON representation contains a document wrapper uuid ('parent') only, we need
     * to map it manually to the document wrapper instance for persistence
     */
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="parent_id", nullable=true)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonAlias("_parent") // hint for model registry
    @JsonIgnore
    var parent: DocumentWrapper? = null

    @Transient
    @JsonSetter("_parent")
    private var parentUuid: String? = null

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
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="draft", nullable=true)
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
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="published", nullable=true)
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
    @ManyToMany(cascade=[CascadeType.ALL], fetch=FetchType.LAZY)
    @JoinTable(
            name="document_archive",
            joinColumns=[JoinColumn(name="wrapper_id")],
            inverseJoinColumns=[JoinColumn(name="document_id")]
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

    @Formula(value = "(select count(dw.id) from document_wrapper dw where dw.parent_id = id)")
    var countChildren: Int = 0
    
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
}
