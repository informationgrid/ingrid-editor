package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import javax.persistence.*

@NoArgs
@Entity
@Table(name = "user_info")
class UserInfo(
    @Column(nullable = false)
    val userId: String,

    @ManyToOne
    @JoinColumn(name="cur_catalog_id", nullable=false)
    val curCatalog: Catalog
) : EntityBase() {

    @ManyToMany(mappedBy="users")
    @JsonIgnore
    var catalogs: Set<Catalog> = setOf()
}