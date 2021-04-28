package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.model.meta.PermissionsData
import org.hibernate.annotations.OnDelete
import org.hibernate.annotations.OnDeleteAction
import org.hibernate.annotations.Type
import javax.persistence.*

@NoArgs
@Entity
@Table(name="permission_group")
class Group {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @JsonProperty("db_id")
    var id: Int? = null
    
    @Column(nullable=false)
    @JsonProperty("id")
    var identifier: String? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @OnDelete(action = OnDeleteAction.CASCADE)
    @JsonIgnore
    var catalog: Catalog? = null

    @Column(nullable=false)
    var name: String? = null

    @Column
    var description: String? = null

    @Type(type="jsonb")
    @Column(name="permissions", columnDefinition="jsonb")
    var data: PermissionsData? = null

    @Column(nullable=false)
    @JsonProperty("_type")
    var type: String? = null
}
