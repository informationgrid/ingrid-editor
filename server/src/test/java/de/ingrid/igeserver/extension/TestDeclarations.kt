package de.ingrid.igeserver.extension

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.extension.pipe.*
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.stereotype.Component

/**
 * Test payloads
 */

open class TestPayloadPersist(var action: Action, var data: JsonNode): Payload {
    /**
     * Persistence action to perform on the contained data
     */
    enum class Action {
        CREATE,
        UPDATE,
        PUBLISH,
        UNPUBLISH,
        DELETE
    }
}

open class TestPayloadCreate(data: JsonNode) : TestPayloadPersist(Action.CREATE, data)

open class TestPayloadUpdate(data: JsonNode) : TestPayloadPersist(Action.UPDATE, data) {
    constructor(action: Action, data: JsonNode) : this(data) {
        this.action = action
    }
}

open class TestPayloadPublish(data: JsonNode) : TestPayloadUpdate(Action.PUBLISH, data)

open class TestPayloadPostPublish(data: JsonNode) : TestPayloadPublish(data)

/**
 * Test filters
 */

// Common validation on persist (used as base class)
@Component
class TestValidatePersistFilter<T : TestPayloadPersist> : Filter<T> {

    override fun invoke(payload: T, context: Context): T {
        if (payload.action == TestPayloadPersist.Action.CREATE || payload.action == TestPayloadPersist.Action.UPDATE) {
            context.messages.add(Message(this, "Validate data on persist"))
        }
        else {
            context.messages.add(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on create
@Component
class TestValidateCreateFilter : Filter<TestPayloadCreate>, TestValidatePersistFilter<TestPayloadCreate>() {

    override fun invoke(payload: TestPayloadCreate, context: Context): TestPayloadCreate {
        super.invoke(payload, context)
        if (payload.action == TestPayloadPersist.Action.CREATE) {
            context.messages.add(Message(this, "Validate data on create"))
        }
        else {
            context.messages.add(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on update
@Component
class TestValidateUpdateFilter : Filter<TestPayloadUpdate>, TestValidatePersistFilter<TestPayloadUpdate>() {

    override fun invoke(payload: TestPayloadUpdate, context: Context): TestPayloadUpdate {
        super.invoke(payload, context)
        if (payload.action == TestPayloadPersist.Action.UPDATE) {
            context.messages.add(Message(this, "Validate data on update"))
        }
        else {
            context.messages.add(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on publish (can be used with update payload or publish payload)
@Component
class TestValidatePublishFilter<T : TestPayloadUpdate> : Filter<T> {

    override fun invoke(payload: T, context: Context): T {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.messages.add(Message(this, "Validate data on publish"))
        }
        else {
            context.messages.add(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Authorization on publish
@Component
class TestAuthorizePublishFilter : Filter<TestPayloadPublish> {

    override fun invoke(payload: TestPayloadPublish, context: Context): TestPayloadPublish {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.messages.add(Message(this, "Authorize on publish"))
        }
        else {
            context.messages.add(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

/**
 * Pipes
 */

class TestCreatePipe : Pipe<TestPayloadCreate>("CreatePipe")

class TestUpdatePipe : Pipe<TestPayloadUpdate>("UpdatePipe")

class TestPublishPipe : Pipe<TestPayloadPublish>("PublishPipe")

/**
 * Bean configuration
 */

@Configuration
class PipeTestConfig {
    @Bean
    fun validatePersistFilter(): Filter<TestPayloadPersist> = TestValidatePersistFilter()

    @Bean
    fun validateCreateFilter(): Filter<TestPayloadCreate> = TestValidateCreateFilter()

    @Bean
    fun validateUpdateFilter(): Filter<TestPayloadUpdate> = TestValidateUpdateFilter()

    @Bean
    fun validateUpdatePublishFilter(): Filter<TestPayloadUpdate> = TestValidatePublishFilter()

    @Bean
    fun validatePublishFilter(): Filter<TestPayloadPublish> = TestValidatePublishFilter()

    @Bean
    fun authorizePublishFilter(): Filter<TestPayloadPublish> = TestAuthorizePublishFilter()

    @Bean
    fun createPipe(): Pipe<TestPayloadCreate> = TestCreatePipe()

    @Bean
    fun updatePipe(): Pipe<TestPayloadUpdate> = TestUpdatePipe()

    @Bean
    fun publishPipe(): Pipe<TestPayloadPublish> = TestPublishPipe()

    @Bean
    fun postPublishPipe(): Pipe<TestPayloadPostPublish> = Pipe("PostPublishPipe")
}