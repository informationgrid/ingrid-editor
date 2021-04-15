package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import org.hibernate.annotations.NamedQueries
import org.hibernate.annotations.NamedQuery
import org.hibernate.annotations.Type
import java.util.*
import javax.persistence.*

@Entity
@Table(name="catalog")
@NamedQueries(
    NamedQuery(
        name="Catalog_FindByIdentifier", query="from Catalog where identifier = :identifier"
    )
)
class Catalog {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @JsonProperty("db_id")
    var id: Int? = null
    
    @Column(nullable=false)
    @JsonProperty("id")
    lateinit var identifier: String

    // TODO: make type non null
    @Column(nullable=false)
    lateinit var type: String

    @Column(nullable=false)
    lateinit var name: String

    @Column
    var description: String? = null

    @ManyToMany(mappedBy="catalogs", fetch= FetchType.LAZY)
    @JsonIgnore
    var users: MutableSet<UserInfo> = LinkedHashSet<UserInfo>()

    @Type(type = "jsonb")
    @Column(name = "settings", columnDefinition = "jsonb")
    var settings: CatalogSettings? = null

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