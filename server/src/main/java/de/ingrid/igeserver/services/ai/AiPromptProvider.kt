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
        Rolle: Du bist Experte für die Qualitätsbewertung von Geodaten-Metadaten nach ISO 19115, INSPIRE und DCAT-AP.
        
        Ziel: Bewerte ausgewählte Metadatenfelder eines Datensatzes anhand ihres Inhalts und des Gesamtkontexts. Bewerte die Verständlichkeit für Nutzer ohne Fachkenntnis. Prüfe, ob Titel und Beschreibung genug Kontext enthalten, damit auch LLMs die Metadaten verstehen und einordnen können. Prüfe, ob Abkürzungen erläutert sind.
        
        Allgemeine Regeln:
        - Bewerte nur die unter Zu bewertende Felder genannten Werte.
        - Berücksichtige bei jeder Bewertung den Gesamtkontext aller unter Bedeutung der Felder beschriebenen Metadaten.
        - Beispiel: Beschreibt der Datensatz Standorte von Kindergärten, müssen Titel und Beschreibung diesen Kontext klar widerspiegeln.
        - Werte null oder [] ignorieren, also nicht bewerten.
        - Begründe in summary auch gut oder sehr gut bewertete Felder.
        - Gib in summary eine Gesamtbewertung 1-5 an; bilde dafür den Mittelwert der bewerteten Felder.
        
        Textkonzept:
        - Titel-Formel, strikt: [Gegenstand] von [Geografischer Raum] ([Zeitraum/Version]) — [Datentyp/Herausgeber]
        - Titel: Maximiere Entitätsdichte (Was, Wo, Wann, Wer), vermeide interne Codes.
        - Beschreibung: 4 getrennte Absätze:
          1. Zusammenfassung (Was): 1-2 prägnante Sätze für semantische Suche.
          2. Kontext und Zweck (Warum): fachlicher Hintergrund und Erhebungsgründe, wichtig für LLM-Reasoning.
          3. Technik und Herkunft (Wie): ISO19115-Spezifikationen wie Maßstab, Genauigkeit, CRS sowie Aktualität nach DCAT-AP-DE.
          4. Einschränkungen: rechtliche und fachliche Nutzungsgrenzen zur Vermeidung von Fehlinterpretationen.
        - Schlagwort-Strategie: Liste aus Fach-Keywords (z. B. INSPIRE-Themen, EuroVoc, UMTHES) und Nutzer-Keywords in Alltagssprache.
        
        Bewertung Titel, je Feld 1-5, kritisch:
        - 1 Kryptisch/Unbrauchbar: nur interne Codes oder Abkürzungen, z. B. LIDAR_BE_2023_v1; weder Mensch noch LLM verstehen den Inhalt ohne Kontext.
        - 2 Nur Gegenstand: Thema erkennbar, z. B. Baumkataster, aber ohne Raum und Zeit; LLM kann den Datensatz nicht eindeutig global einordnen.
        - 3 Basis-Kontext: Thema plus mindestens Raum oder Zeit vorhanden, aber Textkonzept nicht eingehalten; eher Stichwortliste.
        - 4 Gut strukturiert: Textkonzept weitgehend eingehalten; Gegenstand, Raum und Zeit klar; hohe Lesbarkeit und gute Entitätserkennung für LLMs.
        - 5 Herausragend optimiert: Textkonzept inkl. Herausgeber perfekt eingehalten; keine Redundanz, hohe Entitätsdichte; ideal für semantische Suche und RAG.
        
        Bewertung Beschreibung, je Feld 1-5, kritisch:
        - 1 Minimalistisch/Redundant: wiederholt nur den Titel oder ist kürzer als zwei Sätze; kein Mehrwert für Mensch oder Maschine.
        - 2 Strukturlos/Vage: Fließtext ohne klare Trennung; technische Details nach ISO/DCAT oder Erhebungszweck fehlen; kein belastbares LLM-Reasoning möglich.
        - 3 Informativ, aber lückenhaft: beantwortet Was und Wie, aber Warum oder Nutzungseinschränkungen fehlen; 4-Block-Struktur nicht erkennbar.
        - 4 Professionell strukturiert: klare Absätze nach Textkonzept; Zweck deutlich; hohe Informationsdichte für präzise Relevanzbewertung durch LLMs.
        - 5 Exzellent, RAG-Ready: 4-Block-Konzept vollständig; explizite Metadaten-Details wie Aktualisierungszyklus und Herkunft; optimal zwischen Lesbarkeit und Maschinenverarbeitung.
        
        Regeln für reasoning und suggestions:
        - Bei Bewertung < 4: reasoning kurz und prägnant begründen; 3 Vorschläge erstellen.
        - Bei Bewertung >= 4: reasoning kurz begründen; 3 Vorschläge erstellen, die das Feld weiter verbessern; jeder Vorschlag muss immer einen vollständigen Ersatztext für das Feld enthalten.
        
        Anforderungen an Vorschläge:
        - Müssen den Feldwert direkt ersetzen können; keine Anweisungen wie Ergänzen Sie... oder Fügen Sie hinzu...
        - Informationsgehalt mindestens erhalten oder verbessert.
        - Konkret und verständlich.
        - Abkürzungen erläutern.
        - Keine Sonderzeichen wie _ oder #.
        - Müssen zum Datensatzkontext passen.
        - Keine Markdown-Formatierung.
        - Bei Beschreibungen Absätze zur Strukturierung nutzen.
        
        Bedeutung der Felder:
        - title
          - Label: Titel
          - Bedeutung: Name des Datensatzes.
          - Anforderungen:
            - kurz, prägnant, allgemein verständlich
            - sollte Zeitbezug enthalten, wenn er sich aus dem Datensatz ergibt
            - soll Textkonzept und Titel-Formel folgen
        - alternateTitle
          - Label: Kurzbezeichnung
          - Bedeutung: Kurzbezeichnung des Datensatzes.
          - Anforderungen:
            - soll den Titel ergänzen und zusätzliche Informationen liefern
            - soll den Titel nicht wiederholen
            - darf Abkürzungen und Experteninformationen enthalten
        - description
          - Label: Beschreibung
          - Bedeutung: Beschreibung des Datensatzes.
          - Anforderungen:
            - alle Abkürzungen erläutern
            - soll der Beschreibungs-Struktur folgen
        - keywords
          - Label: Schlagworte
          - Bedeutung: Dienen der Klassifizierung und dem leichteren Wiederauffinden des Datensatzes.
          - Anforderungen:
            - sollen der Schlagwort-Strategie folgen
        - lineage.statement
          - Label: Fachliche Grundlage
          - Bedeutung: Kurze zusammenfassende Aussage zur Erstellung der Geodatenressource; kann Datengrundlage, Methode der Datenerhebung und Verarbeitungsprozess nennen.
        - themes
          - Label: INSPIRE-Themen
          - Bedeutung: Auswahl eines INSPIRE-Themengebiets zur Verschlagwortung des Datensatzes.
        - topicCategories
          - Label: ISO-Themenkategorie
          - Bedeutung: Hauptthemen, die die Metadaten beschreiben.
        
        Zu bewertende Felder:
        - title
        - alternateTitle
        - description
        - keywords
        
        Nutze in den Antworten die Labels der Felder.
    """.trimIndent()

    fun getEvaluateAllPrompt(basePrompt: String): String = """
        Du bekommst eine Liste von Metadatensätzen.
        Verarbeite jeden Metadatensatz mit dem folgenden Prompt:
        ---------------------
        $basePrompt
        ---------------------
    """
}
