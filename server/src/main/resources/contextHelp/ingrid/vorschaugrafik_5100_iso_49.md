---
id: graphicOverviews
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
title: Vorschaugrafik
---

# Vorschaugrafik

Tragen Sie hier eine URL ein, unter welcher eine Grafik abgerufen werden kann. Diese Grafik wird im Portal in der Suchergebnisliste neben dem Treffer angezeigt.

## Beispiel:

https://domain.de/pfad/grafik.png

# ISO Abbildung

Grafik, die die Ressource darstellt (möglichst einschließlich Legende)

Domain: 31 (gmd:graphicOverview), 49 (gmd:fileName)


## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <identificationInfo>
    <MD_DataIdentification>
      <graphicOverview>
        <MD_BrowseGraphic>
          <fileName>
            <gco:CharacterString>URL TO EXTERNAL IMAGE</gco:CharacterString>
          </fileName>
        </MD_BrowseGraphic>
      </graphicOverview>
    </MD_DataIdentification>
  </identificationInfo>
</MD_Metadata>
```

