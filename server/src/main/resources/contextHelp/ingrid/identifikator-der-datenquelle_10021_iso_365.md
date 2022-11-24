---
# ID des GUI Elements
id: identifier
docType: InGridGeoDataset
profile: ingrid


# title, used as window title
title: Identifikator der Datenquelle
---

# Identifikator der Datenquelle

Hier muss ein eindeutiger Name (Identifikator) für die im Datenobjekt beschriebene Datenquelle (z.B. eine Karte) vergeben werden. Der Identifikator soll aus einem Namensraum (=codespace), abgeschlossen mit einem Doppelkreuz, sowie einem Code bestehen. (INSPIRE-Pflichtfeld).

Wenn der Identifikator keinen Namensraum mit '#'-Zeichen enthält, so wird dem Identifikator bei der Abgabe der Metadaten derjenige Wert vorangestellt, welcher im Bereich Katalogverwaltung/Katalogeinstellungen unter "Namensraum des Katalogs" eingetragen ist. Hierbei wird das '#' automatisch ergänzt.

Der Identifikator kann auch von Hand eingetragen werden oder mit Hilfe des Buttons "Erzeuge ID". Bei der automatischen Erzeugung wird eine UUID als Identifikator in dieses Feld eingetragen. Da diese UUID keinen Namespace enthält, wird bei dieser Variante immer der Namensraum aus der Katalogverwaltung hinzugefügt.

## Beispiel:

Namensraum: http://image2000.jrc.it#<br/>Code: image2000_1_nl2_multi<br/>Identifikator: http://image2000.jrc.it#image2000_1_nl2_multi

# ISO Abbildung

Identifikator: Wert zur eindeutigen Identifikation der Ressource in einem Namensraum

Domain: 365 (gmd:identifier)
