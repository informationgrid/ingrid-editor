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

import com.fasterxml.jackson.module.kotlin.jacksonObjectMapper
import de.ingrid.igeserver.extension.pipe.Pipe
import de.ingrid.igeserver.extension.pipe.impl.DefaultContext
import io.kotest.core.spec.style.FunSpec
import io.kotest.extensions.spring.SpringExtension
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.shouldStartWith
import io.kotest.matchers.types.beInstanceOf
import org.apache.http.auth.BasicUserPrincipal
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.test.context.ContextConfiguration
import org.springframework.test.context.TestPropertySource

@ContextConfiguration(classes = [(PipeTestConfig::class)])
@TestPropertySource(
    properties = [
        "pipes.filter.order={'PublishPipe': {" +
            "'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'," +
            "'de.ingrid.igeserver.extension.TestValidatePublishFilter'" +
            "} }",
        "pipes.filter.disabled={'CreatePipe': {" +
            "'de.ingrid.igeserver.extension.TestValidateCreateFilter'" +
            "} }",
    ],
)
class PipeTest : FunSpec() {
    override fun extensions() = listOf(SpringExtension)

    @Autowired
    lateinit var createPipe: Pipe<TestPayloadCreate>

    @Autowired
    lateinit var updatePipe: Pipe<TestPayloadUpdate>

    @Autowired
    lateinit var publishPipe: Pipe<TestPayloadPublish>

    @Autowired
    lateinit var postPublishPipe: Pipe<TestPayloadPostPublish>

    init {
        test("a pipe should run all contained filters") {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadUpdate(data)
            val context = DefaultContext("", "", null, BasicUserPrincipal("meier"))

            val result = updatePipe.runFilters(payload, context)

            updatePipe.extensions.size shouldBe 2
            result.data shouldBe data
            context.messages().count() shouldBe 6
            arrayOf(
                TestUpdatePipe::class to "Running filters on pipe 'UpdatePipe' for profile ''",
                TestUpdatePipe::class to "Running filter 'de.ingrid.igeserver.extension.TestValidateUpdateFilter'",
                TestValidateUpdateFilter::class to "Validate data on persist",
                TestValidateUpdateFilter::class to "Validate data on update",
                TestUpdatePipe::class to "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'",
                TestValidatePublishFilter::class to "Filter does not apply",
            ).forEachIndexed { index, expectation ->
                val m = context.messages().elementAt(index)
                m.creator should beInstanceOf(expectation.first)
                m.message shouldStartWith expectation.second
            }
        }

        test("a pipe should run all filters in the configured sequence") {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadPublish(data)
            val context = DefaultContext("", "", null, BasicUserPrincipal("meier"))

            val result = publishPipe.runFilters(payload, context)

            publishPipe.extensions.size shouldBe 4
            result.data shouldBe data
            context.messages().count() shouldBe 7
            arrayOf(
                TestPublishPipe::class to "Running filters on pipe 'PublishPipe' for profile ''",
                TestPublishPipe::class to "Running filter 'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'",
                TestAuthorizePublishFilter::class to "Authorize on publish",
                TestPublishPipe::class to "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'",
                TestValidatePublishFilter::class to "Validate data on publish",
            ).forEachIndexed { index, expectation ->
                val m = context.messages().elementAt(index)
                m.creator should beInstanceOf(expectation.first)
                m.message shouldStartWith expectation.second
            }
        }

        test("a pipe should not run filters that are disabled by configuration") {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadCreate(data)
            val context = DefaultContext("", "", null, BasicUserPrincipal("meier"))

            val result = createPipe.runFilters(payload, context)

            createPipe.extensions.size shouldBe 1
            result.data shouldBe data
            context.messages().count() shouldBe 2
            arrayOf(
                TestCreatePipe::class to "Running filters on pipe 'CreatePipe' for profile ''",
                TestCreatePipe::class to "Skipped filter 'de.ingrid.igeserver.extension.TestValidateCreateFilter' because it is disabled by configuration",
            ).forEachIndexed { index, expectation ->
                val m = context.messages().elementAt(index)
                m.creator should beInstanceOf(expectation.first)
                m.message shouldStartWith expectation.second
            }
        }

        test("a pipe should run all filters that match the profile of the context") {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadPublish(data)
            val context = DefaultContext("", "profileA", null, BasicUserPrincipal("meier"))

            val result = publishPipe.runFilters(payload, context)

            publishPipe.extensions.size shouldBe 4
            result.data shouldBe data
            context.messages().count() shouldBe 8
            arrayOf(
                TestPublishPipe::class to "Running filters on pipe 'PublishPipe' for profile 'profileA'",
                TestPublishPipe::class to "Running filter 'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'",
                TestAuthorizePublishFilter::class to "Authorize on publish",
                TestPublishPipe::class to "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'",
                TestValidatePublishFilter::class to "Validate data on publish",
                TestPublishPipe::class to "Running filter 'de.ingrid.igeserver.extension.TestAuthorizePublishProfileAFilter'",
                TestAuthorizePublishProfileAFilter::class to "Authorize on publish for 'profileA'",
                TestPublishPipe::class to "Skipped filter 'de.ingrid.igeserver.extension.TestAuthorizePublishNullFilter' because it does not apply to profile 'profileA'",
            ).forEachIndexed { index, expectation ->
                val m = context.messages().elementAt(index)
                m.creator should beInstanceOf(expectation.first)
                m.message shouldStartWith expectation.second
            }
        }

        test("a pipe should not run profile specific filters if the context has no profile") {
            val data = jacksonObjectMapper().readTree("{\"name\": \"John\", \"age\": \"35\"}")
            val payload = TestPayloadPublish(data)
            val context = DefaultContext("", "", null, BasicUserPrincipal("meier"))

            val result = publishPipe.runFilters(payload, context)

            publishPipe.extensions.size shouldBe 4
            result.data shouldBe data
            context.messages().count() shouldBe 7
            arrayOf(
                TestPublishPipe::class to "Running filters on pipe 'PublishPipe' for profile ''",
                TestPublishPipe::class to "Running filter 'de.ingrid.igeserver.extension.TestAuthorizePublishFilter'",
                TestAuthorizePublishFilter::class to "Authorize on publish",
                TestPublishPipe::class to "Running filter 'de.ingrid.igeserver.extension.TestValidatePublishFilter'",
                TestValidatePublishFilter::class to "Validate data on publish",
                TestPublishPipe::class to "Skipped filter 'de.ingrid.igeserver.extension.TestAuthorizePublishProfileAFilter' because it does not apply to profile ''",
                TestPublishPipe::class to "Skipped filter 'de.ingrid.igeserver.extension.TestAuthorizePublishNullFilter' because it does not apply to profile ''",
            ).forEachIndexed { index, expectation ->
                val m = context.messages().elementAt(index)
                m.creator should beInstanceOf(expectation.first)
                m.message shouldStartWith expectation.second
            }
        }

        test("an explicit pipe @Component must be declared for each payload") {
            // NOTE The postPublishPipe is declared as Pipe<TestPayloadPostPublish> without providing a @Component of
            // type Pipe<TestPayloadPostPublish>. One could expect that only filters of type
            // Filter<TestPayloadPostPublish> would be injected. But actually
            // @Autowired will inject filters of *all* payload types.
            postPublishPipe.extensions.size shouldBe 8
        }
    }
}
