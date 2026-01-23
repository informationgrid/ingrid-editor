---
# ID des GUI Elements
id: description
docType:
  - InGridDataCollection
  - InGridGeoDataset
  - InGridGeoService
  - InGridSpecialisedTask
  - InGridInformationSystem
  - InGridProject

# title, used as window title
title: Beschreibung
---

# Beschreibung - Information für die Fachredaktionen

Kurz gefasste, für die Öffentlichkeit verständliche Beschreibung der Objektart. Fokus auf Inhalt und Zweck der Daten. Fachbegriffe und Abkürzungen generell sparsam verwenden und ggf. erläutern, da die Beschreibung auch für Personen außerhalb des Fachkontextes nachvollziehbar sein sollte.

## Beispiel:

"Alle wasserwirtschaftlich relevanten Fließgewässer Baden-Württembergs. Einschließlich ständig fließender Gewässer ab 500 m Länge, Gewässer zur Verortung von wasserwirtschaftlichen Objekten und Gewässer für Planungszwecke."

# ISO Abbildung

kurze, beschreibende Zusammenfassung des Inhalts der Ressource

Domain: 25 (gmd:abstract)

## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <identificationInfo>
    <MD_DataIdentification>
      <abstract>
        <gco:CharacterString>DESCRIPTION</gco:CharacterString>
     </abstract>
    </MD_DataIdentification>
  </identificationInfo>
</MD_Metadata>
```
