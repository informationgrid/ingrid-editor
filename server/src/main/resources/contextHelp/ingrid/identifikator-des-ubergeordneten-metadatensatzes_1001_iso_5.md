---
# ID des GUI Elements
id: parentIdentifier
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
title: Identifikator des übergeordneten Metadatensatzes
---

# Identifikator des übergeordneten Metadatensatzes

Für Datensätze in der obersten Ebene oder direkt unter einem Ordner kann eine zusätzliche Referenz auf einen übergeordneten Metadatensatz vergeben werden. Dadurch ist es möglich, auch auf externe Datensätze zu verweisen.

## Beispiel:

93CD0919-5A2F-4286-B731-645C34614AA1

# ISO Abbildung

Eindeutiger Identifikator des übergeordneten Metadatensatzes (Elternobjekt), auf den sich der aktuelle Metadatensatz (Kindobjekt) bezieht

Domain: 5 (gmd:parentIdentifier)


## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <parentIdentifier>
    <gco:CharacterString>FILEIDENTIFIER OF PARENTS METADATASET</gco:CharacterString>
  </parentIdentifier>
</MD_Metadata>
```

