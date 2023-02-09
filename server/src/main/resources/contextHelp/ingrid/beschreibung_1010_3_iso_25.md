---
# ID des GUI Elements
id: serviceTypeVersion
docType: InGridInformationSystem
profile: ingrid



# title, used as window title
title: Beschreibung
---

# Beschreibung

Fachliche Inhaltsangabe des Geodatendienstes. Hier sollen in knapper Form die Art des Dienstes sowie die fachlichen Informationsgehalte beschrieben werden. Auf Verständlichkeit für fachfremde Dritte ist zu achten. DV-technische Einzelheiten sollten auf zentrale, kennzeichnende Aspekte beschränkt werden. Das Feld Beschreibungen muss ausgefüllt werden, damit das Objekt abgespeichert werden kann.

Bei gewünschter Mehrsprachigkeit muss dieses Feld nach dem Schema "Deutscher Text#locale-eng:English text" gefüllt werden. Beispiel: Apfelbaum#locale-eng:apple tree

# ISO Abbildung

kurze, beschreibende Zusammenfassung des Inhalts der Ressource

Domain: 25 (gmd:abstract)

## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <identificationInfo>
    <srv:SV_ServiceIdentification>
      <abstract>
        <gco:CharacterString>DESCRIPTION</gco:CharacterString>
     </abstract>
    </srv:SV_ServiceIdentification>
  </identificationInfo>
</MD_Metadata>
```
