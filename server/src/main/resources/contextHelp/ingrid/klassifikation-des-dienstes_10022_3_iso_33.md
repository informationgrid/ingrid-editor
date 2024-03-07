---
# ID des GUI Elements
id: classification
docType: InGridGeoService
profile: ingrid

# title, used as window title
title: Klassifikation des Dienstes
---

# Klassifikation des Dienstes

Auswahl der Beschreibung des Dienstes. Dieses Feld dient in erster Linie der Identifikation eines Dienstes durch den recherchierenden Nutzer.

## Beispiel:

z.B. Katalogdienst, Dienst für geografische Visualisierung, usw.

# ISO Abbildung

 Die Angaben werden im ISO 19139 Format als Schlüsselwort abgebildet. Die Abbildung folgt der "Technical Guidance for INSPIRE Spatial Data Services". Als Thesaurus Name wird "Service Classification, version 1.0" verwendet.

Domain: 33 (gmd:descriptiveKeywords)

Beispiel-Einträge der keywords im ISO-xml je nach Auswahl der Klassifikation:

| Codelisten-Eintrag | keyword |
|----------------    |---------|
|Dienst für geografische Visualisierung|human GeographicViewer|
|Dienst für den Zugriff auf Objekte | infoFeatureAccessService |
| Dienst für den Zugriff auf grafische Darstellungen | infoMapAccessService |
| Dienst für den Zugriff auf Rasterdaten | infoCoverageAccessService |
| Dienst für den Zugriff auf Objektarten | infoFeatureTypeService |
| Katalogdienst (Service) | infoCatalogueService |
