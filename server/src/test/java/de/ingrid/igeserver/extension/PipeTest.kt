package de.ingrid.igeserver.extension

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.extension.pipe.Pipe
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.beInstanceOf
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldStartWith
import io.kotest.spring.SpringListener
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource

@ContextConfiguration(classes = [(PipeTestConfig::class)])
@TestPropertySource(properties = [
    "pipes.filter.order={'PublishPipe': {" +
            "'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'," +
            "'de.ingrid.igeserver.extension.TestValidatePublishFilter'" +
    "} }",
    "pipes.filter.disabled={'CreatePipe': {" +
            "'de.ingrid.igeserver.extension.TestValidateCreateFilter'" +
    "} }"
])
class PipeTest : FunSpec() {
    override fun listeners() = listOf(SpringListener)

    @Autowired
    lateinit var createPipe: Pipe<TestPayloadCreate>

    @Autowired
    lateinit var updatePipe: Pipe<TestPayloadUpdate>

    @Autowired
    lateinit var publishPipe: Pipe<TestPayloadPublish>

    @Autowired
    lateinit var postPublishPipe: Pipe<TestPayloadPostPublish>

    init {
        test("a pipe should run all contained filters")
        {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadUpdate(data)
            val context = DefaultContext(null)

            val result = updatePipe.runFilters(payload, context)

            result.data shouldBe data
            context.messages().count() shouldBe 6

            val m1 = context.messages().elementAt(0)
            m1.creator should beInstanceOf(TestUpdatePipe::class)
            m1.message shouldStartWith "Running filters on pipe 'UpdatePipe' for profile 'null'"

            val m2 = context.messages().elementAt(1)
            m2.creator should beInstanceOf(TestUpdatePipe::class)
            m2.message shouldStartWith "Running filter 'de.ingrid.igeserver.extension.TestValidateUpdateFilter'"

            val m3 = context.messages().elementAt(2)
            m3.creator should beInstanceOf(TestValidateUpdateFilter::class)
            m3.message shouldStartWith "Validate data on persist"

            val m4 = context.messages().elementAt(3)
            m4.creator should beInstanceOf(TestValidateUpdateFilter::class)
            m4.message shouldStartWith "Validate data on update"

            val m5 = context.messages().elementAt(4)
            m5.creator should beInstanceOf(TestUpdatePipe::class)
            m5.message shouldStartWith "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'"

            val m6 = context.messages().elementAt(5)
            m6.creator should beInstanceOf(TestValidatePublishFilter::class)
            m6.message shouldStartWith "Filter does not apply"
        }

        test("a pipe should run all contained filters in the configured sequence")
        {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadPublish(data)
            val context = DefaultContext(null)

            val result = publishPipe.runFilters(payload, context)

            result.data shouldBe data
            context.messages().count() shouldBe 5

            val m1 = context.messages().elementAt(0)
            m1.creator should beInstanceOf(TestPublishPipe::class)
            m1.message shouldStartWith "Running filters on pipe 'PublishPipe' for profile 'null'"

            val m2 = context.messages().elementAt(1)
            m2.creator should beInstanceOf(TestPublishPipe::class)
            m2.message shouldStartWith "Running filter 'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'"

            val m3 = context.messages().elementAt(2)
            m3.creator should beInstanceOf(TestAuthorizePublishFilter::class)
            m3.message shouldStartWith "Authorize on publish"

            val m4 = context.messages().elementAt(3)
            m4.creator should beInstanceOf(TestPublishPipe::class)
            m4.message shouldStartWith "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'"

            val m5 = context.messages().elementAt(4)
            m5.creator should beInstanceOf(TestValidatePublishFilter::class)
            m5.message shouldStartWith "Validate data on publish"
        }

        test("a pipe should run only the contained filters that are not disabled")
        {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadCreate(data)
            val context = DefaultContext(null)

            val result = createPipe.runFilters(payload, context)

            result.data shouldBe data
            context.messages().count() shouldBe 1
        }

        test("a pipe should run only the contained filters that match the profile of the context").config(enabled = false)
        {
        }

        test("an explicit pipe @Component must be declared for each payload")
        {
            // NOTE The postPublishPipe is declared as Pipe<TestPayloadPostPublish> without providing a @Component of
            // type Pipe<TestPayloadPostPublish>. One could expect that only filters of type
            // Filter<TestPayloadPostPublish> (1) would be injected. But actually
            // @Autowired will inject filters of *all* payload types (6).
            postPublishPipe.extensions.size shouldNotBe 1
            postPublishPipe.extensions.size shouldBe 6
        }
    }
}