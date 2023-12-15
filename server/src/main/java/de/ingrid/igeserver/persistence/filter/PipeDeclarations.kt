/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.persistence.filter

import de.ingrid.igeserver.extension.pipe.Payload
import de.ingrid.igeserver.extension.pipe.Pipe
import de.ingrid.igeserver.persistence.model.EntityType
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Document
import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.DocumentWrapper
import de.ingrid.igeserver.services.InitiatorAction
import de.ingrid.utils.ElasticDocument
import org.springframework.stereotype.Component

/**
 * Declarations of persistence related payloads
 */

/**
 * Base payload for persistence related filters
 */
open class PersistencePayload(
    var action: Action,
    var type: EntityType,
    var catalogIdentifier: String,
    var document: Document,
    var wrapper: DocumentWrapper
) : Payload {
    /**
     * Persistence action to perform on the contained data
     */
    enum class Action {
        CREATE,
        UPDATE,
        PUBLISH,
        UNPUBLISH,
        REVERT,
        DELETE,
        INDEX
    }
}

/**
 * Base payload for pre-persistence related filters
 */
open class PrePersistencePayload(
    action: Action,
    type: EntityType,
    catalogIdentifier: String,
    document: Document,
    wrapper: DocumentWrapper
) :
    PersistencePayload(action, type, catalogIdentifier, document, wrapper) {
    constructor(action: Action, type: EntityType, catalogIdentifier: String, document: Document) : this(
        action,
        type,
        catalogIdentifier,
        document,
        DocumentWrapper()
    )
}

/**
 * Base payload for post-persistence related filters
 */
open class PostPersistencePayload(
    action: Action,
    type: EntityType,
    catalogIdentifier: String,
    document: Document,
    wrapper: DocumentWrapper
) :
    PersistencePayload(action, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data before inserting the document
 */
open class PreCreatePayload(
    type: EntityType,
    catalogIdentifier: String,
    document: Document,
    val category: String,
    val initiator: InitiatorAction
) :
    PrePersistencePayload(Action.CREATE, type, catalogIdentifier, document)

/**
 * Payload holding document data after inserting the document
 */
open class PostCreatePayload(
    type: EntityType,
    catalogIdentifier: String,
    document: Document,
    wrapper: DocumentWrapper
) :
    PostPersistencePayload(Action.CREATE, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data before updating the document
 */
open class PreUpdatePayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PrePersistencePayload(Action.UPDATE, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data after updating the document
 */
open class PostUpdatePayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PostPersistencePayload(Action.UPDATE, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data before publishing the document
 */
open class PrePublishPayload(
    type: EntityType,
    catalogIdentifier: String,
    document: Document,
    wrapper: DocumentWrapper
) :
    PrePersistencePayload(Action.PUBLISH, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data after publishing the document
 */
open class PostPublishPayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PostPersistencePayload(Action.PUBLISH, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data before unpublishing the document
 */
open class PreUnpublishPayload(
    type: EntityType,
    catalogIdentifier: String,
    document: Document,
    wrapper: DocumentWrapper
) :
    PrePersistencePayload(Action.UNPUBLISH, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data after unpublishing the document
 */
open class PostUnpublishPayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PostPersistencePayload(Action.UNPUBLISH, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data before revoking the working copy
 */
open class PreRevertPayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PrePersistencePayload(Action.REVERT, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data after revoking the working copy
 */
open class PostRevertPayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PostPersistencePayload(Action.REVERT, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data before deleting the document
 */
open class PreDeletePayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PrePersistencePayload(Action.DELETE, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding document data after deleting the document
 */
open class PostDeletePayload(type: EntityType, catalogIdentifier: String, document: Document, wrapper: DocumentWrapper) :
    PostPersistencePayload(Action.DELETE, type, catalogIdentifier, document, wrapper)

/**
 * Payload holding index data after indexing the document
 */
open class PostIndexPayload(var indexDoc: ElasticDocument, var category: String, val exportType: String) : Payload

/**
 * Declarations of pipes for different payloads
 *
 * NOTE An explicit @Component declaration for each payload type is necessary when using spring's autowired annotation
 * on a pipe instance. If a pipe instance is declared e.g. of type Pipe<PreCreatePayload> and no @Component declaration
 * for this payload exists, spring will inject *all* Payload implementations instead of only PreCreatePayload instances.
 */

@Component
class PrePersistencePipe : Pipe<PrePersistencePayload>("PrePersistencePipe")

@Component
class PostPersistencePipe : Pipe<PostPersistencePayload>("PostPersistencePipe")

@Component
class PreCreatePipe : Pipe<PreCreatePayload>("PreCreatePipe")

@Component
class PostCreatePipe : Pipe<PostCreatePayload>("PostCreatePipe")

@Component
class PreUpdatePipe : Pipe<PreUpdatePayload>("PreUpdatePipe")

@Component
class PostUpdatePipe : Pipe<PostUpdatePayload>("PostUpdatePipe")

@Component
class PrePublishPipe : Pipe<PrePublishPayload>("PrePublishPipe")

@Component
class PostPublishPipe : Pipe<PostPublishPayload>("PostPublishPipe")

@Component
class PreUnpublishPipe : Pipe<PreUnpublishPayload>("PreUnpublishPipe")

@Component
class PostUnpublishPipe : Pipe<PostUnpublishPayload>("PostUnpublishPipe")

@Component
class PreRevertPipe : Pipe<PreRevertPayload>("PreRevertPipe")

@Component
class PostRevertPipe : Pipe<PostRevertPayload>("PostRevertPipe")

@Component
class PreDeletePipe : Pipe<PreDeletePayload>("PreDeletePipe")

@Component
class PostDeletePipe : Pipe<PostDeletePayload>("PostDeletePipe")

@Component
class PostIndexPipe : Pipe<PostIndexPayload>("PostIndexPipe")
