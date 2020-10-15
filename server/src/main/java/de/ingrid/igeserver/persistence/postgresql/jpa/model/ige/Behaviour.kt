package de.ingrid.igeserver.persistence.postgresql.jpa.model.ige

import com.fasterxml.jackson.annotation.JsonIgnore
import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.model.impl.EntityBase
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithCatalog
import org.hibernate.annotations.Type
import javax.persistence.*

@NoArgs
@Entity
@Table(name="user_info")
class Behaviour(

    @Column(nullable=false)
    val active: Boolean,

    @Type(type="jsonb")
    @Column(columnDefinition="jsonb")
    val data: JsonNode,

    @ManyToOne(fetch=FetchType.LAZY)
    @JoinColumn(name="catalog_id", nullable=false)
    @JsonIgnore
    override var catalog: Catalog?

) : EntityBase(), EntityWithCatalog