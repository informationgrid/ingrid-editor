package de.ingrid.igeserver.persistence.postgresql.jpa.model.impl

import com.fasterxml.jackson.annotation.JsonProperty
import com.fasterxml.jackson.databind.ObjectMapper
import com.fasterxml.jackson.databind.node.ObjectNode
import de.ingrid.igeserver.persistence.postgresql.jpa.model.EntityWithRecordId
import javax.persistence.*

/**
 * Base class for all entities
 */
@MappedSuperclass
open class EntityBase : EntityWithRecordId {

    @Id
    @GeneratedValue(strategy= GenerationType.IDENTITY)
    @field:JsonProperty("db_id")
    override var id: Int? = null

    /**
     * If this property is true, related entities must be replaced by an identifier when serializing the entity
     * NOTE Sub classes are free to choose
     * - which relations are serialized in this way
     * - which property of the related entity is used as identifier
     * But they must be able to resolve a related entity by this identifier if clients sent identifiers
     * only (see beforePersist)
     */

    /**
     * Implementing this method allows sub classes to run custom code (e.g. resolve related objects from identifiers)
     * after deserialization and before persisting
     */
    open fun beforePersist(entityManager: EntityManager) {}

    /**
     * Implementing this method allows sub classes to map the related entities in the serialized instance
     * (json parameter) according to the value of the resolveReferences parameter
     *
     * If resolveReferences is true, related entities must be contained in the serialized instance, if false they
     * must be replaced by an identifier
     *
     * NOTE Sub classes are free to choose
     * - which relations are serialized in this way
     * - which property of the related entity is used as identifier
     *
     * Nevertheless they must be able to resolve a related entity by this identifier if clients sent identifiers
     * only (see beforePersist)
     */
    open fun serializeRelations(json: ObjectNode, mapper: ObjectMapper, resolveReferences: Boolean) {}

    /**
     * Implementing this method allows sub classes to map query values before they are used in the database query, e.g.
     * resolve resolve entity identifiers returned by serializeRelations back to database row ids
     */
    open fun mapQueryValue(field: String, value: String?, entityManager: EntityManager): Any? {
        return value
    }
}