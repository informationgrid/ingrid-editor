package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import com.vladmihalcea.hibernate.type.json.JsonType
import de.ingrid.igeserver.persistence.postgresql.model.meta.PermissionsData
import jakarta.persistence.*
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.annotations.Type

@Entity
@Table(name="permission_group")
class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalog: Catalog? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="manager_id", nullable=false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var manager: UserInfo? = null

    @ManyToMany(mappedBy = "groups", fetch=FetchType.LAZY)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var user: MutableSet<UserInfo> = HashSet()

    @Column(nullable=false)
    var name: String? = null

    @Column
    var description: String? = null

    @Type(JsonType::class)
    @Column(name="permissions", columnDefinition="jsonb")
    @JsonProperty("permissions")
    var permissions: PermissionsData? = null

    @Type(JsonType::class)
    @Column(name = "data", columnDefinition = "jsonb")
    var data: GroupData? = null

}
