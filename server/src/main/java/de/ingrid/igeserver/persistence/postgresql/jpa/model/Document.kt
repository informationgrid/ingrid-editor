package de.ingrid.igeserver.persistence.postgresql.jpa.model

import com.fasterxml.jackson.annotation.JsonFormat
import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import java.time.LocalDateTime
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name="document")
class Document(

    @Column(nullable=false)
    val uuid: UUID = UUID.randomUUID(),

    @Column(nullable=false)
    val title: String,

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog?,

    data: EmbeddedData?

) : EntityWithEmbeddedData(data), EntityWithCatalog, EntityWithVersion {

    @ManyToMany(mappedBy = "archive")
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