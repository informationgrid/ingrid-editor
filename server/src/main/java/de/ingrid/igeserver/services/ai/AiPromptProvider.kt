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

import org.springframework.stereotype.Component

@Component
class AiPromptProvider {
    fun getEvaluatePrompt(): String = """
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

    fun getEvaluateAllPrompt(basePrompt: String): String = """
            Du bekommst eine Liste von Metadatensätze.
            Verarbeite jeden Metadatensatz mit dem folgenden Prompt:
            ---------------------
            $basePrompt
            ---------------------
    """
}
