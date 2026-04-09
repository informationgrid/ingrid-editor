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

        val chatCompletionRequest = ChatCompletionRequest(
            model = ModelId(generalProperties.openAIModel),
            reasoningEffort = Effort("medium"),
            messages = listOf(
                ChatMessage(
                    role = ChatRole.System,
                    content = getSystemPrompt(),
                ),
                ChatMessage(
                    role = ChatRole.User,
                    content = body,
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

            Ziel:
            Bewerte ausgewählte Metadatenfelder eines Datensatzes anhand ihres Inhalts und im Kontext des gesamten Datensatzes.
    
            Allgemeine Regeln:
            - Bewerte ausschließlich die unter "Zu bewertende Felder" aufgeführten Werte.
            - Berücksichtige bei jeder Bewertung den Gesamtkontext aller unter "Bedeutung der Felder" beschriebenen Metadaten.
            - Beispiel: Beschreibt der Datensatz Standorte von Kindergärten, müssen Titel und Beschreibung diesen Kontext klar widerspiegeln.
            - Werte können "null" oder leere Arrays "[]" sein. Diese müssen ignoriert werden (keine Bewertung).
    
            Bewertung:
            - Vergib für jedes Feld eine Punktzahl von 1 bis 10.
    
            Bedeutung der Bewertung:
            - 1–3 = sehr schlecht
            - 4–6 = mittelmäßig
            - 7–8 = gut
            - 9–10 = ausgezeichnet
    
            Regeln für Begründung (reasoning) und Vorschläge (suggestions):
            - Wenn die Bewertung < 7:
              - Gib eine kurze, prägnante Begründung für die niedrige Bewertung.
              - Erstelle 3 Vorschläge.
            - Wenn die Bewertung ≥ 7:
              - Setze Begründung = null
              - Setze Vorschläge = null

            Anforderungen an Vorschläge:
            - Müssen den Wert direkt ersetzen können.
            - Müssen konkret und verständlich sein.
            - Keine Sonderzeichen wie "_", "#", etc.
            - Müssen zum Datensatzkontext passen.
            
            Bedeutung der Felder:
            - title
              - Label: Name
              - Bedeutung: Der Name des Datensatzes.
            - alternateTitle
              - Label: Kurzbezeichnung
              - Bedeutung: Die Kurzbezeichnung des Datensatzes.
            - description
              - Label: Beschreibung
              - Bedeutung: Die Beschreibung des Datensatzes.
            - keywords
              - Label: Schlagworte
              - Bedeutung: Die Verschlagwortung dient der Klassifizierung und dem einfacheren Wiederauffinden eines Datensatzes.
            - lineage.statement
              - Label: Fachliche Grundlage
              - Bedeutung: Kurze zusammenfassende Aussage zur Erstellung dieser Geodatenressource. Hierzu können die Datengrundlage, die Methode der Datenerhebung und der Verarbeitungsprozess erwähnt werden.
            - themes
              - Label: INSPIRE-Themen
              - Bedeutung: Auswahl eines INSPIRE Themengebiets zur Verschlagwortung des Datensatzes.
            - topicCategories
              - Label: ISO-Themenkategorie
              - Bedeutung: Angabe der Hauptthemen, welche die Metadaten beschreiben.

            Zu bewertende Felder:
            - title
            - alternateTitle
            - description
        """.trimIndent()
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
