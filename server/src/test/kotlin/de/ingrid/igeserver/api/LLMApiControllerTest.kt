package de.ingrid.igeserver.api

import com.fasterxml.jackson.databind.ObjectMapper
import io.kotest.assertions.throwables.shouldThrow
import io.kotest.core.spec.style.ShouldSpec
import io.kotest.matchers.nulls.shouldNotBeNull
import io.kotest.matchers.should
import io.kotest.matchers.shouldBe
import io.kotest.matchers.string.contain
import io.mockk.*
import org.springframework.test.util.ReflectionTestUtils
import java.net.http.HttpClient
import java.net.http.HttpResponse

class LLMApiControllerTest : ShouldSpec({

    val mockHttpClient = mockk<HttpClient>()
    val mockHttpResponse = mockk<HttpResponse<String>>()
    val llmApiController = LLMApiController()
    val testApiUrl = "https://api.test.com"
    val testApiKey = "test-api-key"
    val objectMapper = ObjectMapper()

    beforeTest {
        ReflectionTestUtils.setField(llmApiController, "mistralApiUrl", testApiUrl)
        ReflectionTestUtils.setField(llmApiController, "mistralApiKey", testApiKey)
        ReflectionTestUtils.setField(llmApiController, "client", mockHttpClient)
        ReflectionTestUtils.setField(llmApiController, "objectMapper", objectMapper)
    }

    context("processMessage") {
        should("return response content when API call is successful") {
            // Arrange
            val testMessage = "Hello, AI!"
            val expectedContent = "Hello, human!"
            val request = LLMRequest(testMessage)

            val responseJson = """
            {
                "choices": [
                    {
                        "message": {
                            "content": "$expectedContent"
                        }
                    }
                ]
            }
            """

            every { mockHttpResponse.statusCode() } returns 200
            every { mockHttpResponse.body() } returns responseJson
            every { mockHttpClient.send(any(), any<HttpResponse.BodyHandler<String>>()) } returns mockHttpResponse

            // Act
            val result = llmApiController.processMessage(request)

            // Assert
            result.content shouldBe expectedContent
            verify { mockHttpClient.send(any(), any<HttpResponse.BodyHandler<String>>()) }
        }

        should("throw RuntimeException when API returns non-200 status code") {
            // Arrange
            val testMessage = "Hello, AI!"
            val request = LLMRequest(testMessage)

            every { mockHttpResponse.statusCode() } returns 400
            every { mockHttpClient.send(any(), any<HttpResponse.BodyHandler<String>>()) } returns mockHttpResponse

            // Act & Assert
            val exception = shouldThrow<RuntimeException> {
                llmApiController.processMessage(request)
            }
            exception.message should contain("400")
        }

        should("throw RuntimeException when API response structure is invalid") {
            // Arrange
            val testMessage = "Hello, AI!"
            val request = LLMRequest(testMessage)

            val responseJson = """
            {
                "invalid": "response"
            }
            """

            every { mockHttpResponse.statusCode() } returns 200
            every { mockHttpResponse.body() } returns responseJson
            every { mockHttpClient.send(any(), any<HttpResponse.BodyHandler<String>>()) } returns mockHttpResponse

            // Act & Assert
            shouldThrow<RuntimeException> {
                llmApiController.processMessage(request)
            }
        }

        xshould("return plausible response with real API") {
            // This test will use the real HttpClient instance
            val realHttpClient = HttpClient.newHttpClient()
            ReflectionTestUtils.setField(llmApiController, "client", realHttpClient)

            // Arrange
            val realApiUrl = System.getenv("MISTRAL_API_URL") ?: "https://api.mistral.ai/v1"
            val realApiKey = System.getenv("MISTRAL_API_KEY") ?: return@xshould
            ReflectionTestUtils.setField(llmApiController, "mistralApiUrl", realApiUrl)
            ReflectionTestUtils.setField(llmApiController, "mistralApiKey", realApiKey)

            val testMessage = "What is 2+2?"
            val request = LLMRequest(testMessage)

            // Act
            val result = llmApiController.processMessage(request).content

            // Assert
            result.shouldNotBeNull()
            result should contain("4")
        }
    }
})