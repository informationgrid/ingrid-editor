package de.ingrid.igeserver.extension

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import de.ingrid.igeserver.persistence.filter.PersistencePayload
import de.ingrid.igeserver.persistence.filter.ValidatePublishFilter
import de.ingrid.igeserver.persistence.filter.ValidateUpdateFilter
import de.ingrid.igeserver.extension.pipe.Filter
import de.ingrid.igeserver.extension.pipe.Pipe
import io.kotest.core.spec.style.FunSpec
import io.kotest.matchers.beInstanceOf
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.spring.SpringListener
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.test.context.ContextConfiguration

@Configuration
class TestConfig {
    @Bean
    fun extensions(): List<Filter<PersistencePayload>> = mutableListOf(ValidateUpdateFilter(), ValidatePublishFilter())

    @Bean
    fun pipe(): Pipe<PersistencePayload> = Pipe<PersistencePayload>("DatasetsUpdate")
}

@ContextConfiguration(classes = [(TestConfig::class)])
class PipeTest : FunSpec() {
    override fun listeners() = listOf(SpringListener)

    @Autowired
    private lateinit var pipe: Pipe<PersistencePayload>

    init {
        test("a pipe should run all contained filters in the configured sequence")
        {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = PersistencePayload(
                    action = PersistencePayload.Action.PUBLISH,
                    data = data
            )
            val context = DefaultContext()

            val result = pipe.runFilters(payload, context)

            result.data shouldBe data
            context.messages.size shouldBe 3

            val m1 = context.messages.poll()
            m1.creator should beInstanceOf(Pipe::class)
            m1.message shouldBe "Running filter 'class de.ingrid.igeserver.persistence.filter.ValidateUpdateFilter'"

            val m2 = context.messages.poll()
            m2.creator should beInstanceOf(Pipe::class)
            m2.message shouldBe "Running filter 'class de.ingrid.igeserver.persistence.filter.ValidatePublishFilter'"

            val m3 = context.messages.poll()
            m3.creator should beInstanceOf(ValidatePublishFilter::class)
            m3.message shouldBe "Validate data on publish"
        }
    }
}