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
                putJsonObject("uuid") {
                    put("type", "string")
                }
                putJsonObject("title") {
                    put("type", "string")
                }
                putJsonObject("summary") {
                    put("type", "string")
                }
                putJsonObject("totalScore") {
                    put("type", "number")
                    put("minimum", 1)
                    put("maximum", 10)
                }
                putJsonObject("totalSuggestionCount") {
                    put("type", "number")
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
                            putJsonObject("originalValue") {
                                putJsonArray("anyOf") {
                                    addJsonObject { put("type", "string") }
                                    addJsonObject { put("type", "null") }
                                }
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
                            add("originalValue")
                            add("reasoning")
                            add("suggestions")
                        }
                        put("additionalProperties", false)
                    }
                }
            }
            putJsonArray("required") {
                add("uuid")
                add("title")
                add("summary")
                add("totalScore")
                add("totalSuggestionCount")
                add("evaluations")
            }
            put("additionalProperties", false)
        },
    )

    fun getEvaluateAllResponseSchema(): JsonSchema = JsonSchema(
        name = "BatchEvaluationSummary",
        strict = true,
        schema = buildJsonObject {
            put("type", "object")
            putJsonObject("properties") {
                putJsonObject("data") {
                    put("type", "array")
                    put("items", getEvaluateResponseSchema().schema)
                }
            }
            putJsonArray("required") {
                add("data")
            }
            put("additionalProperties", false)
        },
    )
}