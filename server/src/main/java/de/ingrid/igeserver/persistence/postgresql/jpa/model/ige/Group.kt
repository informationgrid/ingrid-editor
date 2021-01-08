package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.AbstractEntityWithEmbeddedData
import de.ingrid.igeserver.persistence.postgresql.model.meta.PermissionsData
import org.hibernate.annotations.Type
import javax.persistence.*
import kotlin.jvm.Transient

@NoArgs
@Entity
@Table(name="permission_group")
@org.hibernate.annotations.NamedQueries(
    org.hibernate.annotations.NamedQuery(
            name="Group_FindByIdentifier", query="from Group where identifier = :identifier"
    )
)
class Group : AbstractEntityWithEmbeddedData<PermissionsData>(), EntityWithCatalog {

    @Column(nullable=false)
    @JsonProperty("id")
    var identifier: String? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog? = null

    @Column(nullable=false)
    var name: String? = null

    @Column
    var description: String? = null

    @Type(type="embeddedData")
    @Column(name="permissions", columnDefinition="jsonb")
    override var data: PermissionsData? = null
        set(value) {
            type = value?.typeColumnValue
            field = value
        }

    companion object {
        /**
         * Retrieve a group instance by it's identifier
         */
        fun getByIdentifier(entityManager: EntityManager, identifier: String?): Group? {
            if (identifier == null) return null

            return entityManager.createNamedQuery("Group_FindByIdentifier", Group::class.java).
                setParameter("identifier", identifier).singleResult
        }
    }

    @Column(nullable=false)
    @JsonProperty("_type")
    override var type: String? = null
}
