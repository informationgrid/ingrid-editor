---
# ID des GUI Elements
id: spatial1
docType:
  - InGridDataCollection
  - InGridGeoDataset
  - InGridGeoService
  - InGridSpecialisedTask
  - InGridInformationSystem
  - InGridPublication
  - InGridProject
profile: ingrid


# title, used as window title
title: Geothesaurus-Raumbezug
---

# Geothesaurus-Raumbezug

Informationen über die räumliche Zuordnung des in dem Objekt beschriebenen Datenbestandes. Über den Geothesaurus-Navigator kann nach den Koordinaten der räumlichen Einheit gesucht werden.

# ISO Abbildung

Geografische Ausdehnung: geografische Komponente der Ausdehnung des betreffenden Objekts

Domain: 336 (gmd:geographicElement)

## Abbildung ISO 19139

```
<gmd:geographicElement>
  <gmd:EX_GeographicDescription>
    <gmd:extentTypeCode>
      <gco:Boolean>true</gco:Boolean>
    </gmd:extentTypeCode>
    <gmd:geographicIdentifier>
      <gmd:MD_Identifier>
        <gmd:code>
          <gco:CharacterString>[Geothesaurus-Raumbezug]</gco:CharacterString>
        </gmd:code>
      </gmd:MD_Identifier>
    </gmd:geographicIdentifier>
  </gmd:EX_GeographicDescription>
</gmd:geographicElement>
<gmd:geographicElement>
  <gmd:EX_GeographicBoundingBox>
    <gmd:extentTypeCode>
      <gco:Boolean>true</gco:Boolean>
    </gmd:extentTypeCode>
    <gmd:westBoundLongitude>
      <gco:Decimal>[Länge 1]</gco:Decimal>
    </gmd:westBoundLongitude>
    <gmd:eastBoundLongitude>
      <gco:Decimal>[Länge 2]</gco:Decimal>
    </gmd:eastBoundLongitude>
    <gmd:southBoundLatitude>
      <gco:Decimal>[Breite 1]</gco:Decimal>
    </gmd:southBoundLatitude>
    <gmd:northBoundLatitude>
      <gco:Decimal>[Breite 2]</gco:Decimal>
    </gmd:northBoundLatitude>
  </gmd:EX_GeographicBoundingBox>
</gmd:geographicElement>
```
