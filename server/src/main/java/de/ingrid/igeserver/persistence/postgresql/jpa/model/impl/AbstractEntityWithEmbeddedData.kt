package de.ingrid.igeserver.persistence.postgresql.jpa.model.impl

import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonIgnore
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.EmbeddedData
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataUserType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithEmbeddedData
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.util.*
import javax.persistence.MappedSuperclass

/**
 * Default implementation of EntityWithEmbeddedData interface. Subclasses must define the data and type properties
 * with the appropriate JPA mapping annotations.
 */
@NoArgs
@MappedSuperclass
@TypeDefs(
        TypeDef(name="jsonb", typeClass=JsonBinaryType::class),
        TypeDef(name="embeddedData", typeClass=EmbeddedDataUserType::class)
)
abstract class AbstractEntityWithEmbeddedData<T: EmbeddedData> : EntityBase(), EntityWithEmbeddedData<T> {

    /**
     * Collects data fields into map when deserializing to be used by deserializer later
     * (see de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataDeserializer)
     */
    @JsonAnySetter
    @Transient
    @get:JsonIgnore
    override var dataFields: Map<String, Any>? = HashMap()

    @Transient
    @JsonIgnore
    override var unwrapData: Boolean = true
}