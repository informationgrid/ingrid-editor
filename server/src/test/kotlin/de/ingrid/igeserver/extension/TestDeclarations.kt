/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.extension

import com.fasterxml.jackson.databind.JsonNode
import de.ingrid.igeserver.extension.pipe.Context
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Message
import de.ingrid.igeserver.extension.pipe.Payload
import de.ingrid.igeserver.extension.pipe.Pipe
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration

/**
 * Test payloads
 */

open class TestPayloadPersist(var action: Action, var data: JsonNode) : Payload {
    /**
     * Persistence action to perform on the contained data
     */
    enum class Action {
        CREATE,
        UPDATE,
        PUBLISH,
        DELETE,
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
open class TestValidatePersistFilter<T : TestPayloadPersist>(override val profiles: Array<String>?) : Filter<T> {

    override fun invoke(payload: T, context: Context): T {
        if (payload.action == TestPayloadPersist.Action.CREATE || payload.action == TestPayloadPersist.Action.UPDATE) {
            context.addMessage(Message(this, "Validate data on persist"))
        } else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on create
open class TestValidateCreateFilter(profiles: Array<String>) :
    TestValidatePersistFilter<TestPayloadCreate>(profiles),
    Filter<TestPayloadCreate> {

    override fun invoke(payload: TestPayloadCreate, context: Context): TestPayloadCreate {
        super.invoke(payload, context)
        if (payload.action == TestPayloadPersist.Action.CREATE) {
            context.addMessage(Message(this, "Validate data on create"))
        } else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on update
open class TestValidateUpdateFilter(profiles: Array<String>) :
    TestValidatePersistFilter<TestPayloadUpdate>(profiles),
    Filter<TestPayloadUpdate> {

    override fun invoke(payload: TestPayloadUpdate, context: Context): TestPayloadUpdate {
        super.invoke(payload, context)
        if (payload.action == TestPayloadPersist.Action.UPDATE) {
            context.addMessage(Message(this, "Validate data on update"))
        } else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Specific validation on publish (can be used with update payload or publish payload)
open class TestValidatePublishFilter<T : TestPayloadUpdate>(override val profiles: Array<String>?) : Filter<T> {

    override fun invoke(payload: T, context: Context): T {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.addMessage(Message(this, "Validate data on publish"))
        } else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Authorization on publish
open class TestAuthorizePublishFilter(override val profiles: Array<String>?) : Filter<TestPayloadPublish> {

    override fun invoke(payload: TestPayloadPublish, context: Context): TestPayloadPublish {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.addMessage(Message(this, "Authorize on publish"))
        } else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Authorization on publish only for profileA
open class TestAuthorizePublishProfileAFilter(override val profiles: Array<String>?) : Filter<TestPayloadPublish> {

    override fun invoke(payload: TestPayloadPublish, context: Context): TestPayloadPublish {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.addMessage(Message(this, "Authorize on publish for 'profileA'"))
        } else {
            context.addMessage(Message(this, "Filter does not apply"))
        }
        return payload
    }
}

// Authorization on publish for no profile (deactivated)
open class TestAuthorizePublishNullFilter(override val profiles: Array<String>?) : Filter<TestPayloadPublish> {

    override fun invoke(payload: TestPayloadPublish, context: Context): TestPayloadPublish {
        if (payload.action == TestPayloadPersist.Action.PUBLISH) {
            context.addMessage(Message(this, "Should not run"))
        } else {
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
    fun testValidatePersistFilter(): Filter<TestPayloadPersist> = TestValidatePersistFilter(arrayOf())

    @Bean
    fun testValidateCreateFilter(): Filter<TestPayloadCreate> = TestValidateCreateFilter(arrayOf())

    @Bean
    fun testValidateUpdateFilter(): Filter<TestPayloadUpdate> = TestValidateUpdateFilter(arrayOf())

    @Bean
    fun testValidateUpdatePublishFilter(): Filter<TestPayloadUpdate> = TestValidatePublishFilter(arrayOf())

    @Bean
    fun testValidatePublishFilter(): Filter<TestPayloadPublish> = TestValidatePublishFilter(arrayOf())

    @Bean
    fun testAuthorizePublishFilter(): Filter<TestPayloadPublish> = TestAuthorizePublishFilter(arrayOf())

    @Bean
    fun testAuthorizePublishProfileAFilter(): Filter<TestPayloadPublish> = TestAuthorizePublishProfileAFilter(arrayOf("profileA"))

    @Bean
    fun testAuthorizePublishNullFilter(): Filter<TestPayloadPublish> = TestAuthorizePublishNullFilter(null)

    @Bean
    fun testCreatePipe(): Pipe<TestPayloadCreate> = TestCreatePipe()

    @Bean
    fun testUpdatePipe(): Pipe<TestPayloadUpdate> = TestUpdatePipe()

    @Bean
    fun testPublishPipe(): Pipe<TestPayloadPublish> = TestPublishPipe()

    @Bean
    fun testPostPublishPipe(): Pipe<TestPayloadPostPublish> = Pipe("PostPublishPipe")
}
