/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.*
import jakarta.persistence.*
import org.hibernate.annotations.JdbcTypeCode
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.type.SqlTypes

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
        joinColumns = [JoinColumn(name = "user_info_id", referencedColumnName = "id", nullable = false)],
        inverseJoinColumns = [JoinColumn(name = "group_id", referencedColumnName = "id", nullable = false)]
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

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "data", columnDefinition = "jsonb")
    var data: UserInfoData? = null
    
    fun getGroupsForCatalog(catalogIdentifier: String): Set<Group> =
        groups.filter { it.catalog?.identifier == catalogIdentifier }.toSet()

}