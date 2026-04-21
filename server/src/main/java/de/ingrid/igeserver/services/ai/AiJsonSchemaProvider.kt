package de.ingrid.igeserver.services.ai

import com.aallam.openai.api.chat.JsonSchema
import kotlinx.serialization.json.add
import kotlinx.serialization.json.addJsonObject
import kotlinx.serialization.json.buildJsonObject
import kotlinx.serialization.json.put
import kotlinx.serialization.json.putJsonArray
import kotlinx.serialization.json.putJsonObject
import org.springframework.stereotype.Component

@Component
class AiJsonSchemaProvider {
    fun getEvaluateResponseSchema(): JsonSchema = JsonSchema(
        name = "EvaluationSummary",
        strict = true,
        schema = buildJsonObject {
            put("type", "object")
            putJsonObject("properties") {
                putJsonObject("summary") {
                    put("type", "string")
                }
                putJsonObject("evaluations") {
                    put("type", "array")
                    putJsonObject("items") {
                        put("type", "object")
                        putJsonObject("properties") {
                            putJsonObject("key") { put("type", "string") }
                            putJsonObject("label") { put("type", "string") }
                            putJsonObject("score") {
                                put("type", "number")
                                put("minimum", 1)
                                put("maximum", 10)
                            }
                            putJsonObject("reasoning") {
                                putJsonArray("anyOf") {
                                    addJsonObject { put("type", "string") }
                                    addJsonObject { put("type", "null") }
                                }
                            }
                            putJsonObject("suggestions") {
                                putJsonArray("anyOf") {
                                    addJsonObject {
                                        put("type", "array")
                                        putJsonObject("items") {
                                            put("type", "string")
                                        }
                                    }
                                    addJsonObject { put("type", "null") }
                                }
                            }
                        }
                        putJsonArray("required") {
                            add("key")
                            add("label")
                            add("score")
                            add("reasoning")
                            add("suggestions")
                        }
                        put("additionalProperties", false)
                    }
                }
            }
            putJsonArray("required") {
                add("evaluations")
                add("summary")
            }
            put("additionalProperties", false)
        },
    )
}