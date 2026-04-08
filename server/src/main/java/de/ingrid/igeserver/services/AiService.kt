/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.services

import com.aallam.openai.api.chat.*
import com.aallam.openai.api.http.Timeout
import com.aallam.openai.api.logging.Logger
import com.aallam.openai.api.model.ModelId
import com.aallam.openai.client.LoggingConfig
import com.aallam.openai.client.OpenAI
import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.configuration.GeneralProperties
import kotlinx.serialization.json.*
import org.springframework.stereotype.Service
import kotlin.time.Duration.Companion.seconds

@Service
class AiService(
    private val generalProperties: GeneralProperties
) {
    suspend fun evaluate(body: String): String? {
        if (generalProperties.openAIToken.isNullOrEmpty()) {
            throw ServerException.withReason("No OpenAI-Token configured")
        }

        val openAI = OpenAI(
            token = generalProperties.openAIToken,
            timeout = Timeout(socket = 60.seconds),
            logging = LoggingConfig(logger = Logger.Empty),
        )

        val json = Json.parseToJsonElement(body).jsonObject
        val chatCompletionRequest = ChatCompletionRequest(
            model = ModelId(generalProperties.openAIModel),
            reasoningEffort = Effort("low"),
            messages = listOf(
                ChatMessage(
                    role = ChatRole.System,
                    content = getSystemPrompt(),
                ),
                ChatMessage(
                    role = ChatRole.User,
                    content = getUserPrompt(json),
                ),
            ),
            responseFormat = ChatResponseFormat.jsonSchema(
                getResponseFormat(),
            ),
        )

        val completion: ChatCompletion = openAI.chatCompletion(chatCompletionRequest)

        return completion.choices.firstOrNull()?.message?.content
    }

    private fun getSystemPrompt(): String {
        return """
            Du bist ein Experte für die Bewertung der Qualität von Geodaten-Metadaten.
    
            Deine Aufgabe ist es, Metadatenfelder eines Datensatzes zu bewerten.
            Manche Felder können "undefined" erscheinen, die ignoriert werden sollen.
            
            Die Bewertung muss den Gesamtkontext des Datensatzes berücksichtigen.
            Wenn der Datensatz beispielsweise Standorte von Kindergärten beschreibt, sollten Name, Beschreibung und Schlagwörter diesen Kontext widerspiegeln.
            
            Bewerte jede Eigenschaft mit einer Punktzahl von 1 bis 10.
            
            Bedeutung der Bewertung:
            1–3 = sehr schlecht
            4–6 = mittelmäßig
            7–8 = gut
            9–10 = ausgezeichnet
                
            Wenn die Bewertung einer Eigenschaft unter 6 liegt:
            - Generiere 3 alternative Vorschläge, die direkt den Wert der Eigenschaft ersetzen können.
            - Gib einen Grund, warum die Bewertung unter 6 liegt.
            
            Zu beachten für den Grund:
            - Der ist nur erforderlich, wenn die Bewertung unter 6 liegt, sonst bleibt der leer.
            - Der Grund sollte kurz, prägnant und nicht länger als 3 Sätze sein.
            
            Bewerte nur die Eigenschaften, die spezifisch genannt sind.
            Zum Schluss, gib eine kurze Zusammenfassung der Bewertungen, die nicht länger als 3 Sätze sein sollte.
            Wenn alls in Ordnung ist, halte die nur in einem Satz, ohne alle Eigenschaften erwähnen zu müssen.
            
            Der Key jeder Eigenschaft wird in die Bewertung unverändert übertragen.
            Der Label ist der Name der Eigenschaft.
            
            Sonderreglungen für Vorschläge der unten genannten Eigenschaften mit ihren Keys:
            
            - [title], [alternateTitle], [description]:
            Die Vorschläge müssen menschlich verständlich sein, d.h. ohne kryptische Zeichen wie "_", "#" und weitere Sonderzeichen.
            
            - [description]:
            Die Verschläge können mit Abschnitten formuliert werden.
        """.trimIndent()
    }

    private fun getUserPrompt(data: JsonObject): String {
        return """
            Datensatz:
      
            Name:
            ${data["title"]?.jsonPrimitive?.content}
            Key: title
            
            Kurzbezeichnung:
            ${data["alternateTitle"]?.jsonPrimitive?.content}
            Key: alternateTitle
            
            Beschreibung:
            ${data["description"]?.jsonPrimitive?.content}
            Key: description
            
            Freie Schlagworte:
            ${data["keywords"]?.jsonObject["free"]?.jsonArray?.map { it.jsonObject["label"]?.jsonPrimitive?.content }?.joinToString(", ")}
            Key: keywords
            
            Fachliche Grundlage:
            ${data["lineage"]?.jsonObject["statement"]?.jsonPrimitive?.content}
            Key: lineage.statement
            
            INSPIRE-Themen:
            ${data["themes"]?.jsonArray?.map { it.jsonObject["value"]?.jsonPrimitive?.content }?.joinToString(", ")}
            Key: themes
            
            ISO-Themenkategorie:
            ${data["topicCategories"]?.jsonArray?.map { it.jsonObject["category"]?.jsonPrimitive?.content }?.joinToString(", ")}
            Key: topicCategories
            
            Bitte bewerte:
            - Name
            - Kurzbezeichnung
            - Beschreibung
        """
    }

    private fun getResponseFormat(): JsonSchema {
        return JsonSchema(
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
                                add("key"); add("label"); add("score"); add("reasoning"); add("suggestions")
                            }
                            put("additionalProperties", false)
                        }
                    }
                }
                putJsonArray("required") {
                    add("evaluations"); add("summary")
                }
                put("additionalProperties", false)
            },
        );
    }
}
