package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.model.meta.PermissionsData
import io.hypersistence.utils.hibernate.type.json.JsonType
import jakarta.persistence.*
import org.hibernate.annotations.Type

@NoArgs
@Entity
@Table(name = "role")
class Role {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    var id: Int? = null

    @Column(nullable = false)
    var name: String? = null

    @Type(JsonType::class)
    @Column(name = "permissions", columnDefinition = "jsonb")
    @JsonProperty("permissions")
    var data: PermissionsData? = null

    @OneToMany(mappedBy = "role")
    var users: MutableSet<UserInfo> = HashSet()

}
