package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name = "document_wrapper")
class DocumentWrapper(

        @Column(nullable = false)
        @field:JsonProperty("_id")
        val uuid: String = UUID.randomUUID().toString(),

        @Column(nullable = false)
        @field:JsonProperty("_type")
        val type: String,

        @Column(nullable = false)
        @field:JsonProperty("_category")
        val category: String,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "parent_id", nullable = true)
        @field:JsonProperty("_parent")
        val parent: DocumentWrapper?,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "catalog_id", nullable = false)
        @JsonIgnore
        override var catalog: Catalog?,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "draft", nullable = true)
        @JsonIgnore
        val draft: Document?,

        @ManyToOne(fetch = FetchType.LAZY)
        @JoinColumn(name = "published", nullable = true)
        @JsonIgnore
        val published: Document?

) : EntityBase(), EntityWithCatalog {

    @ManyToMany(cascade = [CascadeType.ALL], fetch = FetchType.LAZY)
    @JoinTable(
            name = "document_archive",
            joinColumns = [JoinColumn(name = "wrapper_id")],
            inverseJoinColumns = [JoinColumn(name = "document_id")]
    )
    @JsonIgnore
    var archive: Set<Document> = setOf()
}