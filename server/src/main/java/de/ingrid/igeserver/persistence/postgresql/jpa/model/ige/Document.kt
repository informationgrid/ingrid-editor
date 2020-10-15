package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedMap
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithUuid
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithVersion
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.DefaultEntityWithEmbeddedData
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import org.hibernate.annotations.Type
import java.time.LocalDateTime
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name="document")
class Document(

    @Column(nullable=false)
    override val uuid: String = UUID.randomUUID().toString(),

    @Column(nullable=false)
    val title: String,

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog?,

    @Type(type="embeddedData")
    @Column(columnDefinition="jsonb")
    override var data: EmbeddedData? = EmbeddedMap()

) : DefaultEntityWithEmbeddedData(type = data?.typeColumnValue),
        EntityWithEmbeddedData<EmbeddedData>, EntityWithUuid, EntityWithCatalog, EntityWithVersion {

    @ManyToMany(mappedBy="archive")
    @JsonIgnore
    var archiveWrapper: Set<DocumentWrapper> = setOf()

    @Version
    override var version: Int? = null

    @Column
    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss", shape=JsonFormat.Shape.STRING)
    var created: LocalDateTime? = null

    @Column
    @JsonFormat(pattern="yyyy-MM-dd HH:mm:ss", shape=JsonFormat.Shape.STRING)
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
        val dateService: DateService? by lazy {
            SpringContext.getBean(DateService::class.java)
        }
    }
}