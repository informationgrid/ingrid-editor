package de.ingrid.igeserver.extension

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.extension.pipe.Pipe
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.beInstanceOf
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.spring.SpringListener
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource


@ContextConfiguration(classes = [(PipeTestConfig::class)])
@TestPropertySource(properties = [
    "filterOrderMap={'PublishPipe': {" +
            "'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'," +
            "'de.ingrid.igeserver.extension.TestValidatePublishFilter'" +
    "} }",
    "filterDisableMap={'CreatePipe': {" +
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

    init {
        test("a pipe should run all contained filters")
        {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadUpdate(data)
            val context = DefaultContext()

            val result = updatePipe.runFilters(payload, context)

            result.data shouldBe data
            context.messages.size shouldBe 5

            val m1 = context.messages.poll()
            m1.creator should beInstanceOf(UpdatePipe::class)
            m1.message shouldBe "Running filter 'de.ingrid.igeserver.extension.TestValidateUpdateFilter'"

            val m2 = context.messages.poll()
            m2.creator should beInstanceOf(TestValidateUpdateFilter::class)
            m2.message shouldBe "Validate data on persist"

            val m3 = context.messages.poll()
            m3.creator should beInstanceOf(TestValidateUpdateFilter::class)
            m3.message shouldBe "Validate data on update"

            val m4 = context.messages.poll()
            m4.creator should beInstanceOf(UpdatePipe::class)
            m4.message shouldBe "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'"

            val m5 = context.messages.poll()
            m5.creator should beInstanceOf(TestValidatePublishFilter::class)
            m5.message shouldBe "Filter does not apply"
        }

        test("a pipe should run all contained filters in the configured sequence")
        {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadPublish(data)
            val context = DefaultContext()

            val result = publishPipe.runFilters(payload, context)

            result.data shouldBe data
            context.messages.size shouldBe 4

            val m1 = context.messages.poll()
            m1.creator should beInstanceOf(PublishPipe::class)
            m1.message shouldBe "Running filter 'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'"

            val m2 = context.messages.poll()
            m2.creator should beInstanceOf(TestAuthorizePublishFilter::class)
            m2.message shouldBe "Authorize on publish"

            val m3 = context.messages.poll()
            m3.creator should beInstanceOf(PublishPipe::class)
            m3.message shouldBe "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'"

            val m4 = context.messages.poll()
            m4.creator should beInstanceOf(TestValidatePublishFilter::class)
            m4.message shouldBe "Validate data on publish"
        }

        test("a pipe should run only the contained filters that are not disabled")
        {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadCreate(data)
            val context = DefaultContext()

            val result = createPipe.runFilters(payload, context)

            result.data shouldBe data
            context.messages.size shouldBe 0
        }
    }
}