package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithVersion
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.AbstractEntityWithEmbeddedData
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import org.hibernate.annotations.Type
import java.time.LocalDateTime
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name="document")
@org.hibernate.annotations.NamedQueries(
        org.hibernate.annotations.NamedQuery(
                name="Document_FindById", query="from Document where id = :id"
        )
)
class Document : AbstractEntityWithEmbeddedData<EmbeddedData>(), EntityWithCatalog, EntityWithVersion {

    @Column(nullable=false)
    @JsonProperty("_id")
    var uuid: String = UUID.randomUUID().toString()

    @Column(nullable=false)
    var title: String? = null

    @Type(type="embeddedData")
    @Column(columnDefinition="jsonb")
    override var data: EmbeddedData? = null
        set(value) {
            type = value?.typeColumnValue
            field = value
        }

    @Column(nullable=false)
    @JsonProperty("_type")
    override var type: String? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog? = null

    @ManyToMany(mappedBy="archive", fetch=FetchType.LAZY)
    @JsonIgnore
    var archiveWrapper: MutableSet<DocumentWrapper> = LinkedHashSet<DocumentWrapper>()

    @Version
    @JsonProperty("db_version")
    override var version: Int? = null

    @Column
    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss", shape=JsonFormat.Shape.STRING)
    @JsonProperty("_created")
    var created: LocalDateTime? = null

    @Column
    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss", shape=JsonFormat.Shape.STRING)
    @JsonProperty("_modified")
    var modified: LocalDateTime? = null

    @PrePersist
    fun setPersistDate() {
        created = dateService?.now()?.toLocalDateTime()
        modified = created
    }

    @PreUpdate
    fun setUpdateDate() {
        modified = dateService?.now()?.toLocalDateTime()
    }

    companion object {
        private val dateService: DateService? by lazy {
            SpringContext.getBean(DateService::class.java)
        }

        /**
         * Retrieve a document instance by it's database id
         */
        fun getById(entityManager: EntityManager, id: Int?): Document? {
            if (id == null) return null

            return entityManager.createNamedQuery("Document_FindById", Document::class.java).
                setParameter("id", id).singleResult
        }
    }
}