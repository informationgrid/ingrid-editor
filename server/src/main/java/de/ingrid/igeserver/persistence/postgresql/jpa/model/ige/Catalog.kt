package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.annotation.JsonDeserialize
import com.fasterxml.jackson.databind.annotation.JsonSerialize
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateDeserializer
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.DateSerializer
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.services.DateService
import de.ingrid.igeserver.utils.SpringContext
import org.hibernate.annotations.NamedQueries
import org.hibernate.annotations.NamedQuery
import java.time.OffsetDateTime
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name="catalog")
@NamedQueries(
    NamedQuery(
            name="Catalog_FindByIdentifier", query="from Catalog where identifier = :identifier"
    )
)
class Catalog : EntityBase() {

    @Column(nullable=false)
    @JsonProperty("id")
    var identifier: String? = null

    // TODO: make type non null
    @Column(nullable=false)
    var type: String? = null

    @Column(nullable=false)
    lateinit var name: String

    @Column
    var description: String? = null

    @Column
    var version: String? = null

    @Column
    @JsonSerialize(using= DateSerializer::class)
    @JsonDeserialize(using= DateDeserializer::class)
    var created: OffsetDateTime? = null

    @Column
    @JsonSerialize(using= DateSerializer::class)
    @JsonDeserialize(using= DateDeserializer::class)
    var modified: OffsetDateTime? = null

    @ManyToMany(mappedBy="catalogs", fetch= FetchType.LAZY)
    @JsonIgnore
    var users: MutableSet<UserInfo> = LinkedHashSet<UserInfo>()


    @PrePersist
    fun setPersistDate() {
        created = dateService?.now()
        modified = created
    }

    @PreUpdate
    fun setUpdateDate() {
        modified = dateService?.now()
    }
    
    companion object {
        private val dateService: DateService? by lazy {
            SpringContext.getBean(DateService::class.java)
        }
        /**
         * Retrieve a catalog instance by it's identifier
         */
        fun getByIdentifier(entityManager: EntityManager, identifier: String?): Catalog? {
            if (identifier == null) return null

            return entityManager.createNamedQuery("Catalog_FindByIdentifier", Catalog::class.java).
                setParameter("identifier", identifier).singleResult
        }
    }
}
