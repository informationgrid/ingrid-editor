package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.annotation.JsonProperty
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityWithEmbeddedMap
import javax.persistence.*
import kotlin.jvm.Transient

@NoArgs
@Entity
@Table(name="behaviour")
class Behaviour : EntityWithEmbeddedMap(), EntityWithCatalog {

    @Column(nullable=false)
    @JsonProperty("_id")
    var name: String? = null

    @Column(nullable=false)
    var active: Boolean? = null

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog? = null

    @Transient
    @JsonIgnore
    override var unwrapData: Boolean = false
        get() = false // make sure to return false (default value did not work after fresh rebuild)
}