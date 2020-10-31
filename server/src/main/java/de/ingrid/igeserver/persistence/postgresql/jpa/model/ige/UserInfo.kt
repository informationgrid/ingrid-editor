package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonGetter
import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonSetter
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityWithEmbeddedMap
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name="user_info")
class UserInfo : EntityWithEmbeddedMap() {

    @Column(nullable = false)
    val userId: String? = null

    /**
     * Assigned catalogs relation (many-to-many)
     * NOTE Since the JSON representation contains catalog identifiers ('catalogIds') only, we need
     * to map them manually to catalog instances for persistence
     */
    @ManyToMany(mappedBy="users", fetch=FetchType.EAGER)
    @JsonIgnore
    var catalogs: MutableSet<Catalog> = LinkedHashSet<Catalog>()

    @Transient
    @JsonSetter("catalogIds")
    private var catalogIds: Array<String>? = null

    @JsonGetter("catalogIds")
    fun getCatalogIds(): Array<String> {
        if (this.catalogIds == null) {
            this.catalogIds = catalogs.mapNotNull { it.identifier }.toTypedArray()
        }
        return this.catalogIds!!
    }

    /**
     * Current catalog relation (many-to-one)
     * NOTE Since the JSON representation contains a catalog identifier ('curCatalog') only, we need
     * to map it manually to the catalog instance for persistence
     */
    @ManyToOne
    @JoinColumn(name="cur_catalog_id")
    @JsonIgnore
    var curCatalog: Catalog? = null

    @Transient
    @JsonSetter("curCatalog")
    private var curCatalogId: String? = null

    @JsonGetter("curCatalog")
    fun getCurCatalogId(): String? {
        if (this.curCatalogId == null) {
            this.curCatalogId = curCatalog?.identifier
        }
        return this.curCatalogId
    }

    /**
     * Resolve catalog entities from catalog identifiers
     */
    override fun beforePersist(entityManager: EntityManager) {
        curCatalog = Catalog.getByIdentifier(entityManager, curCatalogId)
        catalogIds?.forEach {catalogId ->
            Catalog.getByIdentifier(entityManager, catalogId)?.let { catalog ->
                run {
                    if (!catalogs.any { c -> c.id == catalog.id }) {
                        catalogs.add(catalog)
                    }
                    if (!catalog.users.any { u -> u.id == this.id }) {
                        catalog.users.add(this)
                    }
                }
            }
        }
    }
}