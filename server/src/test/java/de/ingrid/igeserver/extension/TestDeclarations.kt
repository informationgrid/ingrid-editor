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
class TestValidatePersistFilter<T : TestPayloadPersist>(override val profiles: Array<String>?) : Filter<T> {

    override fun invoke(payload: T, context: Context): T {
        if (payload.action == TestPayloadPersist.Action.CREATE || payload.action == TestPayloadPersist.Action.UPDATE) {
            context.addMessage(Message(this, "Validate data on persist"))
        }
        else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on create
@Component
class TestValidateCreateFilter(profiles: Array<String>) : Filter<TestPayloadCreate>, TestValidatePersistFilter<TestPayloadCreate>(profiles) {

    override fun invoke(payload: TestPayloadCreate, context: Context): TestPayloadCreate {
        super.invoke(payload, context)
        if (payload.action == TestPayloadPersist.Action.CREATE) {
            context.addMessage(Message(this, "Validate data on create"))
        }
        else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on update
@Component
class TestValidateUpdateFilter(profiles: Array<String>) : Filter<TestPayloadUpdate>, TestValidatePersistFilter<TestPayloadUpdate>(profiles) {

    override fun invoke(payload: TestPayloadUpdate, context: Context): TestPayloadUpdate {
        super.invoke(payload, context)
        if (payload.action == TestPayloadPersist.Action.UPDATE) {
            context.addMessage(Message(this, "Validate data on update"))
        }
        else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on publish (can be used with update payload or publish payload)
@Component
class TestValidatePublishFilter<T : TestPayloadUpdate>(override val profiles: Array<String>?) : Filter<T> {

    override fun invoke(payload: T, context: Context): T {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.addMessage(Message(this, "Validate data on publish"))
        }
        else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Authorization on publish
@Component
class TestAuthorizePublishFilter(override val profiles: Array<String>?) : Filter<TestPayloadPublish> {

    override fun invoke(payload: TestPayloadPublish, context: Context): TestPayloadPublish {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.addMessage(Message(this, "Authorize on publish"))
        }
        else {
            context.addMessage(Message(this, "Filter does not apply"))
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
    fun validatePersistFilter(): Filter<TestPayloadPersist> = TestValidatePersistFilter(arrayOf())

    @Bean
    fun validateCreateFilter(): Filter<TestPayloadCreate> = TestValidateCreateFilter(arrayOf())

    @Bean
    fun validateUpdateFilter(): Filter<TestPayloadUpdate> = TestValidateUpdateFilter(arrayOf())

    @Bean
    fun validateUpdatePublishFilter(): Filter<TestPayloadUpdate> = TestValidatePublishFilter(arrayOf())

    @Bean
    fun validatePublishFilter(): Filter<TestPayloadPublish> = TestValidatePublishFilter(arrayOf())

    @Bean
    fun authorizePublishFilter(): Filter<TestPayloadPublish> = TestAuthorizePublishFilter(arrayOf())

    @Bean
    fun createPipe(): Pipe<TestPayloadCreate> = TestCreatePipe()

    @Bean
    fun updatePipe(): Pipe<TestPayloadUpdate> = TestUpdatePipe()

    @Bean
    fun publishPipe(): Pipe<TestPayloadPublish> = TestPublishPipe()

    @Bean
    fun postPublishPipe(): Pipe<TestPayloadPostPublish> = Pipe("PostPublishPipe")
}