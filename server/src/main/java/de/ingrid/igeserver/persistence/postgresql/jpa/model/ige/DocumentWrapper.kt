package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name="document_wrapper")
@org.hibernate.annotations.NamedQueries(
        org.hibernate.annotations.NamedQuery(
                name="DocumentWrapper_FindByUuid", query="from DocumentWrapper where uuid = :uuid"
        )
)
class DocumentWrapper : EntityBase(), EntityWithCatalog {

    @Column(nullable=false)
    @JsonProperty("_id")
    var uuid: String = UUID.randomUUID().toString()

    @Column(nullable=false)
    @JsonProperty("_type")
    var type: String? = null

    @Column(nullable=false)
    @JsonProperty("_category")
    var category: String? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog? = null

    /**
     * Parent relation (many-to-one)
     * NOTE Since the JSON representation contains a document wrapper uuid ('parent') only, we need
     * to map it manually to the document wrapper instance for persistence
     */
    @ManyToOne(fetch=FetchType.EAGER)
    @JoinColumn(name="parent_id", nullable=true)
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
    @ManyToMany(cascade=[CascadeType.ALL], fetch=FetchType.EAGER)
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

    /**
     * Resolve document entities from document ids and parent document wrapper from uuid
     */
    override fun beforePersist(entityManager: EntityManager) {
        parent = getByUuid(entityManager, parentUuid)
        draft = Document.getById(entityManager, draftId?.toInt())
        published = Document.getById(entityManager, publishedId?.toInt())

        // update many to many relation to archive documents, since document wrapper is the owner of the
        // relation it is sufficient to maintain this relation end only
        val detached = if (entityManager.contains(this)) {
            entityManager.detach(this)
            true
        } else false
        archive.clear()
        archiveIds?.forEach { docId ->
            Document.getById(entityManager, docId.toInt())?.let { doc ->
                run {
                    if (!archive.any { d -> d.id == doc.id }) {
                        archive.add(doc)
                    }
                }
            }
        }
        if (detached) {
            entityManager.merge(this)
        }
    }

    /**
     * Remove many-to-one entities
     */
    override fun beforeRemove(entityManager: EntityManager) {
        if (draft != null) {
            entityManager.remove(draft)
        }
        if (published != null) {
            entityManager.remove(published)
        }
    }

    /**
     * Replace draft, published and archive references by serialized entities, if requested
     */
    override fun serializeRelations(json: ObjectNode, mapper: ObjectMapper, resolveReferences: Boolean) {
        if (resolveReferences) {
            json.replace("draft", mapper.readTree(mapper.writeValueAsString(draft)))
            json.replace("published", mapper.readTree(mapper.writeValueAsString(published)))
            json.replace("archive", mapper.readTree(mapper.writeValueAsString(archive)))
        }
    }

    /**
     * Resolve parent document wrapper from uuid
     */
    override fun mapQueryValue(field: String, value: String?, entityManager: EntityManager): Any? {
        if (value == null) return null
        return when (field) {
            "_parent" -> {
                getByUuid(entityManager, value)?.id
            }
            else -> value
        }
    }

    companion object {
        /**
         * Retrieve a document wrapper instance by it's uuid
         */
        fun getByUuid(entityManager: EntityManager, uuid: String?): DocumentWrapper? {
            if (uuid == null) return null

            return entityManager.createNamedQuery("DocumentWrapper_FindByUuid", DocumentWrapper::class.java).
                setParameter("uuid", uuid).singleResult
        }
    }
}