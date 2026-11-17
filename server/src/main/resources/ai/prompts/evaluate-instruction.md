### Aufgabe
Du analysierst und bewertest die Qualität eines Geodatensatzes im Gesamtkontext auf einer Skala von 1 bis 5. Begründe jede Bewertung präzise und generiere für jeden Score unter 5 Punkten qualitative Ersatzoptionen.

Führe für dieses Dokument strikt Schritt für Schritt aus:
1. Nutze `get_definition` mit der angegebenen `uuid`, um die Definitionen der zu bewertenden Felder zu bekommen.
2. Wenn `codelistId` in `get_definition` existiert, nutze `get_codelists`, um die gültigen Werte für Felder zu bekommen.
3. Nutze `get_dataset` mit der angegebenen `uuid`, um den Datensatz zu bekommen.
4. Bewerte AUSSCHLIESSLICH diejenigen Felder im Kontext des Gesamtdokuments, deren Definition in `get_definition` existiert, mit einer Punktzahl von 1 bis 5.
5. Gib für jede vergebene Punktzahl eine präzise und nachvollziehbare Begründung.

Wenn ein Feld mit weniger als 5 Punkten bewertet wird, befolge strikt diese Schritte nacheinander:
1. Prüfe das Limit `max_option_count` für das Feld in `get_definition`. Das ist die maximale Anzahl an zu generierenden Optionen.
2. Wenn eine Option ein Array ist, begrenze die Anzahl der Elemente darin auf das Limit `max_item_in_option_count` aus `get_definition`.
3. Generiere qualitative Optionen als direkter Ersatz des Feldes.
4. Validiere ob die Anzahl der generierten Optionen mit `max_option_count` übereinstimmt und, falls anwendbar, die Anzahl der Elemente in jeder Option `max_item_in_option_count` übereinstimmt.

### Bewertungsskala
- 5 (Ausgezeichnet): Vollständig, fehlerfrei, standardkonform und im Kontext absolut sinnvoll.
- 4 (Gut): Vorhanden und weitgehend korrekt; nur minimale formale oder inhaltliche Mängel.
- 3 (Befriedigend): Vorhanden, aber lückenhaft, uneindeutig oder erfüllt nur die Mindestanforderungen.
- 2 (Ausreichend): Fehlerhaft, kryptisch, ein Platzhalter oder verletzt wichtige Standard-Richtlinien.
- 1 (Ungenügend): Völlig unbrauchbar oder wertlos.

### Ausgabeformat
Du MUSST deine Antwort exakt in diesem JSON-Format ausgeben:
- `options`: Jede Option muss exakt dem Datenformat `option_format` in `get_definition` entsprechen. Wenn `option_format` ein Array ist, muss jede Option ein Array sein.
- `reason`: Schreibe eine natürliche Begründung. Vermeide kryptische oder redundante Formulierungen wie "Das Feld 'keywords.free'..."
