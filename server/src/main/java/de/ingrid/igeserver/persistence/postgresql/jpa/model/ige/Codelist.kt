package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.IgeEntity
import org.hibernate.annotations.NamedQueries
import org.hibernate.annotations.NamedQuery
import org.hibernate.annotations.Type
import javax.persistence.*

@NoArgs
@Entity
@Table(name = "codelist")
@NamedQueries(
    NamedQuery(
        name = "Codelist_FindByIdentifier", query = "from Codelist where identifier = :identifier and catalog.id = :catalogId"
    )
)
class Codelist : IgeEntity(), EntityWithCatalog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonIgnore
    override var id: Int? = null

    @Column(nullable = false)
    @JsonProperty("id")
    lateinit var identifier: String

    @Column()
    var name: String? = null

    @Column()
    var description: String? = null

    @Type(type = "jsonb")
    @Column(columnDefinition = "jsonb")
    @JsonProperty("entries")
    var data: JsonNode? = null

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "catalog_id", nullable = false)
    @JsonIgnore
    override var catalog: Catalog? = null

    override fun getByIdentifier(entityManager: EntityManager, identifier: String?): Codelist? {
        if (identifier == null) return null

        return entityManager.createNamedQuery("Codelist_FindByIdentifier", Codelist::class.java)
            .setParameter("identifier", identifier)
            .setParameter("catalogId", catalog?.id)
            .singleResult
    }
}