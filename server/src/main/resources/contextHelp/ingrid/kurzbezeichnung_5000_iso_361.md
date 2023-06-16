---
# ID des GUI Elements
id: alternateTitle
docType:
  - InGridDataCollection
  - InGridGeoDataset
  - InGridGeoService
  - InGridSpecialisedTask
  - InGridInformationSystem
  - InGridLiterature
  - InGridProject
profile: ingrid


# title, used as window title
title: Kurzbezeichnung
---

# Kurzbezeichnung

Angabe einer Kurzbezeichnung für ein Objekt. (Wird insbesondere von GeoMIS.Bund unterstützt)

Bei gewünschter Mehrsprachigkeit muss dieses Feld nach dem Schema "Deutscher Text#locale-eng:English text" gefüllt werden. Beispiel: Apfelbaum#locale-eng:apple tree

## Beispiel:

DTK25 digitale topographische Karte GK25 - Grundkarte

# ISO Abbildung

Kurzbezeichnung oder anderer Titel der Ressource

Domain: 361 (gmd:alternateTitle)

## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <identificationInfo>
    <MD_DataIdentification>
      <citation>
        <CI_Citation>
          <alternateTitle>
            <gco:CharacterString>TITLE</gco:CharacterString>
          </alternateTitle>
        </CI_Citation>
      </citation>
    </MD_DataIdentification>
  </identificationInfo>
</MD_Metadata>
```
