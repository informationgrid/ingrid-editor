package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import org.hibernate.annotations.NamedQueries
import org.hibernate.annotations.NamedQuery
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

    @ManyToMany(mappedBy="catalogs", fetch= FetchType.LAZY)
    @JsonIgnore
    var users: MutableSet<UserInfo> = LinkedHashSet<UserInfo>()

    companion object {
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
