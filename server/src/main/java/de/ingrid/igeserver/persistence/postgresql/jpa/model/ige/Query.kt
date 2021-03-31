package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityWithEmbeddedMap
import javax.persistence.*

@NoArgs
@Entity
@Table(name = "query")
/*@org.hibernate.annotations.NamedQueries(
    org.hibernate.annotations.NamedQuery(
        name = "Query_FindByIdentifier", query = "from Query where identifier = :identifier"
    )
)*/
class Query : EntityWithEmbeddedMap(), EntityWithCatalog {

/*    @Column(nullable = false)
    @JsonProperty("id")
    var identifier: String? = null*/

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @field:JsonProperty("id")
    override var id: Int? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @JsonIgnore
    override var catalog: Catalog? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = true)
    @JsonIgnore
    var user: UserInfo? = null

    @Column(nullable = false)
    var name: String? = null
    
    @Column(nullable = false)
    var category: String? = null

    @Column
    var description: String? = null

}