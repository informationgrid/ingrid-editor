---
# ID des GUI Elements
id: hvdCategories
docType:
  - InGridDataCollection
  - InGridGeoDataset
  - InGridGeoService
  - InGridInformationSystem
  - InGridPublication
profile: ingrid


# title, used as window title
title: HVD Kategorien
---

# HVD Kategorien

Wenn die checkbox "High-Value-Dataset (HVD)" aktiviert ist, muss mindestens eine HVD-Kategorie ausgewählt werden.

## Abbildung ISO 19139 XML

```XML
...
<gmd:descriptiveKeywords>
    <gmd:MD_Keywords>
        <gmd:keyword>
            <gmx:Anchor xlink:href="http://data.europa.eu/bna/c_ac64a52d">Georaum</gmx:Anchor>
        </gmd:keyword>
        ...
        <gmd:thesaurusName>
            <gmd:CI_Citation>
                <gmd:title>
                    <gmx:Anchor xlink:href="http://data.europa.eu/bna/asd487ae75">High-value dataset categories</gmx:Anchor>
                </gmd:title>
                <gmd:date>
                    <gmd:CI_Date>
                        <gmd:date>
                            <gco:Date>2023-09-27</gco:Date>
                        </gmd:date>
                        <gmd:dateType>
                            <gmd:CI_DateTypeCode codeList="https://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="publication"/>
                        </gmd:dateType>
                    </gmd:CI_Date>
                </gmd:date>
                ...
            </gmd:CI_Citation>
```