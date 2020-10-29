package de.ingrid.igeserver.persistence.postgresql.jpa.model.impl

import com.fasterxml.jackson.annotation.JsonIgnore
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedMap
import org.hibernate.annotations.Type
import javax.persistence.*

/**
 * Implementation for EntityWithEmbeddedData that stores jsonb in a column named 'data'.
 * The data is deserialized into a map (EmbeddedMap), so there is no need to have a 'type' column,
 * since all mappings use EmbeddedMap as default, if no type is specified.
 */
@NoArgs
@MappedSuperclass
open class EntityWithEmbeddedMap : AbstractEntityWithEmbeddedData<EmbeddedMap>() {

    @Type(type="embeddedData")
    @Column(name="data", columnDefinition="jsonb")
    override var data: EmbeddedMap? = null

    @Transient
    @JsonIgnore
    override var type: String? = null
}