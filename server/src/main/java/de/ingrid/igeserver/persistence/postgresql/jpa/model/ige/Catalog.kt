package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import javax.persistence.*

@NoArgs
@Entity
@Table(name="catalog")
class Catalog(

    @Column(nullable=false)
    val identifier: String,

    @Column(nullable=false)
    val type: String,

    @Column(nullable=false)
    val name: String,

    @Column
    val description: String? = null,

    @Column
    val version: String? = null,

) : EntityBase() {

    @ManyToMany(cascade=[CascadeType.ALL], fetch=FetchType.LAZY)
    @JoinTable(
            name="catalog_user_info",
            joinColumns=[JoinColumn(name = "catalog_id")],
            inverseJoinColumns=[JoinColumn(name = "user_info_id")]
    )
    @JsonIgnore
    var users: Set<UserInfo> = setOf()
}