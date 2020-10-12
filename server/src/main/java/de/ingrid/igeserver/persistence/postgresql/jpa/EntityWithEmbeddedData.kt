package de.ingrid.igeserver.persistence.postgresql.jpa

import com.fasterxml.jackson.annotation.JsonAnySetter
import com.fasterxml.jackson.annotation.JsonIgnore
import com.vladmihalcea.hibernate.type.json.JsonBinaryType
import de.ingrid.igeserver.annotations.NoArgs
import de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataUserType
import org.hibernate.annotations.Type
import org.hibernate.annotations.TypeDef
import org.hibernate.annotations.TypeDefs
import java.util.*
import javax.persistence.Column
import javax.persistence.MappedSuperclass

/**
 * Base class for entities that store JSON in a property called 'data'.
 */
@NoArgs
@MappedSuperclass
@TypeDefs(
        TypeDef(name = "jsonb", typeClass = JsonBinaryType::class),
        TypeDef(name = "embeddedData", typeClass = EmbeddedDataUserType::class)
)
open class EntityWithEmbeddedData(

    @Type(type = "embeddedData")
    @Column(columnDefinition = "jsonb")
    // @JsonUnwrapped does not work, we use custom EmbeddedDataSerializer
    var data: EmbeddedData? = EmbeddedMap()

) : EntityBase() {

    @Column(nullable = false)
    var type: String? = data?.typeColumnValue

    /**
     * Collect data fields into map when deserializing to be used by deserializer later
     * (see de.ingrid.igeserver.persistence.postgresql.jpa.mapping.EmbeddedDataDeserializer)
     */
    @JsonAnySetter
    @Transient
    @get:JsonIgnore
    var dataFields: Map<String, Any> = HashMap()
}