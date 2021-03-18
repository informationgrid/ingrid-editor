package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityWithEmbeddedMap
import java.util.*
import javax.persistence.*

@NoArgs
@Entity
@Table(name="user_info")
class UserInfo : EntityWithEmbeddedMap() {

    @Column(nullable = false)
    var userId: String? = null

    /**
     * Assigned catalogs relation (many-to-many)
     * NOTE Since the JSON representation contains catalog identifiers ('catalogIds') only, we need
     * to map them manually to catalog instances for persistence
     */
    @ManyToMany(cascade=[CascadeType.ALL], fetch=FetchType.EAGER)
    @JoinTable(
            name="catalog_user_info",
            joinColumns=[JoinColumn(name="user_info_id")],
            inverseJoinColumns=[JoinColumn(name="catalog_id")]
    )
    @JsonAlias("catalogIds") // hint for model registry
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
    @JsonAlias("curCatalog") // hint for model registry
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

        // update many to many relation to catalogs, since user is the owner of the
        // relation it is sufficient to maintain this relation end only
        val detached = if (entityManager.contains(this)) {
            entityManager.detach(this)
            true
        } else false
        catalogs.clear()
        catalogIds?.forEach {catalogId ->
            Catalog.getByIdentifier(entityManager, catalogId)?.let { catalog ->
                run {
                    if (!catalogs.any { c -> c.id == catalog.id }) {
                        catalogs.add(catalog)
                    }
                }
            }
        }
        if (detached) {
            entityManager.merge(this)
        }
    }

    /**
     * Detach catalogs
     */
    override fun beforeRemove(entityManager: EntityManager) {
        catalogs.forEach {
            this.catalogs.remove(it)
        }
    }

    /**
     * Resolve catalog database ids from catalog identifiers
     */
    override fun mapQueryValue(field: String, value: String?, entityManager: EntityManager): Any? {
        if (value == null) return null
        return when (field) {
            "curCatalog" -> {
                Catalog.getByIdentifier(entityManager, value.trim())?.id
            }
            "catalogIds" -> {
                val ids = value.split(',').mapNotNull { identifier ->
                    // we expect catalog identifiers in queries
                    val catalog = Catalog.getByIdentifier(entityManager, identifier.trim())
                    catalog?.id
                }
                ids
            }
            else -> value
        }
    }
}