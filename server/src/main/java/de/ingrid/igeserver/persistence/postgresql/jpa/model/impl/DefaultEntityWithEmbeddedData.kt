package de.ingrid.igeserver.persistence.postgresql.jpa.model.impl

import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonIgnore
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataUserType
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.util.*
import javax.persistence.Column
import javax.persistence.MappedSuperclass

/**
 * Default implementation of EntityWithEmbeddedData interface. Subclasses must define the data property
 * with the appropriate JPA mapping annotations.
 */
@NoArgs
@MappedSuperclass
@TypeDefs(
        TypeDef(name = "jsonb", typeClass = JsonBinaryType::class),
        TypeDef(name = "embeddedData", typeClass = EmbeddedDataUserType::class)
)
abstract class DefaultEntityWithEmbeddedData(

    @Column(nullable=false)
    var type: String?

) : EntityBase() {

    /**
     * Collects data fields into map when deserializing to be used by deserializer later
     * (see de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataDeserializer)
     */
    @JsonAnySetter
    @Transient
    @get:JsonIgnore
    var dataFields: Map<String, Any>? = HashMap()
}