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
profile: ingrid

# title, used as window title
title: Beschreibung
---

# Beschreibung

Fachliche Beschreibung der Organisationseinheit. Im Falle einer Organisationseinheit sind die wesentlichen Zuständigkeitsbereiche/Fachaufgaben aufzuführen und ggf. kurz zu erläutern. Hierbei sollten die umweltbezogenen Fachaufgaben der Organisationseinheit im Vordergrund stehen. Ist das Objekt zur Beschreibung einer einzelnen Fachaufgabe angelegt worden, so ist diese Fachaufgabe näher zu erläutern (rechtliche Grundlage, organisatorische Rahmenbedingungen, Zielsetzung, ggf. Überschneidungen mit anderen Fachaufgaben). Auf Verständlichkeit für fachfremde Dritte ist zu achten. Das Feld Beschreibungen muss ausgefüllt werden, damit das Objekt abgespeichert werden kann.

Bei gewünschter Mehrsprachigkeit muss dieses Feld nach dem Schema "Deutscher Text#locale-eng:English text" gefüllt werden. Beispiel: Apfelbaum#locale-eng:apple tree

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
