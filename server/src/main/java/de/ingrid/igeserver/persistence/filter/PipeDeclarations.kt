package de.ingrid.igeserver.persistence.filter

import com.fasterxml.jackson.databind.node.ObjectNode
import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.extension.pipe.Payload
import de.ingrid.igeserver.extension.pipe.Pipe
import de.ingrid.igeserver.persistence.model.EntityType
import org.springframework.stereotype.Component

/**
 * Declarations of persistence related payloads
 */

/**
 * Base payload for persistence related filters
 */
open class PersistencePayload(var action: Action, var type: EntityType, var document: ObjectNode, var wrapper: ObjectNode): Payload {
    /**
     * Persistence action to perform on the contained data
     */
    enum class Action {
        CREATE,
        UPDATE,
        PUBLISH,
        DELETE
    }
}

/**
 * Base payload for pre-persistence related filters
 */
open class PrePersistencePayload(action: Action, type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PersistencePayload(action, type, document, wrapper) {
    constructor(action: Action, type: EntityType, document: ObjectNode) : this(action, type, document, jacksonObjectMapper().createObjectNode())
}

/**
 * Base payload for post-persistence related filters
 */
open class PostPersistencePayload(action: Action, type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PersistencePayload(action, type, document, wrapper)

/**
 * Payload holding document data before inserting the document
 */
open class PreCreatePayload(type: EntityType, document: ObjectNode, val category: String) :
        PrePersistencePayload(Action.CREATE, type, document)

/**
 * Payload holding document data after inserting the document
 */
open class PostCreatePayload(type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PostPersistencePayload(Action.CREATE, type, document, wrapper)

/**
 * Payload holding document data before updating the document
 */
open class PreUpdatePayload(type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PrePersistencePayload(Action.UPDATE, type, document, wrapper)

/**
 * Payload holding document data after updating the document
 */
open class PostUpdatePayload(type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PostPersistencePayload(Action.UPDATE, type, document, wrapper)

/**
 * Payload holding document data before publishing the document
 */
open class PrePublishPayload(type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PrePersistencePayload(Action.PUBLISH, type, document, wrapper)

/**
 * Payload holding document data after publishing the document
 */
open class PostPublishPayload(type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PostPersistencePayload(Action.PUBLISH, type, document, wrapper)

/**
 * Payload holding document data before deleting the document
 */
open class PreDeletePayload(type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PrePersistencePayload(Action.DELETE, type, document, wrapper)

/**
 * Payload holding document data after deleting the document
 */
open class PostDeletePayload(type: EntityType, document: ObjectNode, wrapper: ObjectNode) :
        PostPersistencePayload(Action.DELETE, type, document, wrapper)

/**
 * Declarations of pipes for different payloads
 *
 * NOTE An explicit @Component declaration for each payload type is necessary when using spring's autowired annotation
 * on a pipe instance. If a pipe instance is declared e.g. of type Pipe<PreCreatePayload> and no @Component declaration
 * for this payload exists, spring will inject *all* Payload implementations instead of only PreCreatePayload instances.
 */

@Component class PrePersistencePipe : Pipe<PrePersistencePayload>("PrePersistencePipe")
@Component class PostPersistencePipe : Pipe<PostPersistencePayload>("PostPersistencePipe")

@Component class PreCreatePipe : Pipe<PreCreatePayload>("PreCreatePipe")
@Component class PostCreatePipe : Pipe<PostCreatePayload>("PostCreatePipe")

@Component class PreUpdatePipe : Pipe<PreUpdatePayload>("PreUpdatePipe")
@Component class PostUpdatePipe : Pipe<PostUpdatePayload>("PostUpdatePipe")

@Component class PrePublishPipe : Pipe<PrePublishPayload>("PrePublishPipe")
@Component class PostPublishPipe : Pipe<PostPublishPayload>("PostPublishPipe")

@Component class PreDeletePipe : Pipe<PreDeletePayload>("PreDeletePipe")
@Component class PostDeletePipe : Pipe<PostDeletePayload>("PostDeletePipe")