package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import io.hypersistence.utils.hibernate.type.json.JsonType
import jakarta.persistence.*
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.annotations.Type

@Entity
@Table(name = "user_info")
class UserInfo {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("id")
    var id: Int? = null

    @Column(nullable = false)
    lateinit var userId: String

    /**
     * Assigned catalogs relation (many-to-many)
     * NOTE Since the JSON representation contains catalog identifiers ('catalogIds') only, we need
     * to map them manually to catalog instances for persistence
     */
    @ManyToMany(cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    @JoinTable(
        name = "catalog_user_info",
        joinColumns = [JoinColumn(name = "user_info_id")],
        inverseJoinColumns = [JoinColumn(name = "catalog_id")]
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalogs: MutableSet<Catalog> = LinkedHashSet()
    
    @ManyToOne
    @JoinColumn(name="role_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var role: Role? = null
    
    @ManyToMany(cascade = [CascadeType.ALL], fetch = FetchType.EAGER)
    @JoinTable(
        name = "user_group",
        joinColumns = [JoinColumn(name = "user_info_id", referencedColumnName = "id", nullable = false, updatable = false)],
        inverseJoinColumns = [JoinColumn(name = "group_id", referencedColumnName = "id", nullable = false, updatable = false)]
    )
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var groups: MutableSet<Group> = LinkedHashSet()

    @Transient
    @JsonSetter("catalogIds")
    private var catalogIds: Array<String>? = null

    @JsonGetter("catalogIds")
    fun getCatalogIds(): Array<String> {
        if (this.catalogIds == null) {
            this.catalogIds = catalogs.map { it.identifier }.toTypedArray()
        }
        return this.catalogIds!!
    }

    /**
     * Current catalog relation (many-to-one)
     * NOTE Since the JSON representation contains a catalog identifier ('curCatalog') only, we need
     * to map it manually to the catalog instance for persistence
     */
    @ManyToOne
    @JoinColumn(name = "cur_catalog_id")
    @OnDelete(action = OnDeleteAction.CASCADE)
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

    @Type(JsonType::class)
    @Column(name = "data", columnDefinition = "jsonb")
    var data: UserInfoData? = null

}