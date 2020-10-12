package de.ingrid.igeserver.persistence.postgresql.jpa.model

import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.EntityBase
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

    @ManyToMany(mappedBy = "users")
    var catalogs: Set<Catalog> = setOf()
}