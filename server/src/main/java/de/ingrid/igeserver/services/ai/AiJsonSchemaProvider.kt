/*
 * ==================================================
 * Copyright (C) 2026 wemove digital solutions GmbH
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
