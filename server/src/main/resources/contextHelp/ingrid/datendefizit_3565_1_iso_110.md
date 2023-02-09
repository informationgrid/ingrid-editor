---
# ID des GUI Elements
id: measResult
docType: InGridGeoDataset
profile: ingrid


# title, used as window title
title: Datendefizit
---

# Datendefizit

Eingabe einer Prozentangabe zum Anteil der Daten, die im Vergleich zum beschriebenen Geltungsbereich fehlen. Diese kann sich auf die Anzahl der Kartenblätter aber auch auf das Datendefizit einer Gesamtkarte beziehen.

## Beispiel:

55

# ISO Abbildung

Datendefizit: Daten, die im Vergleich zum beschriebenen Geltungsbereich fehlen

Domain: 110 (gmd:DQ_CompletenessOmission)

## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <dataQualityInfo>
    <DQ_DataQuality>
      <scope>
        <DQ_Scope>
          <level>
            <MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="dataset"/>
          </level>
        </DQ_Scope>
      </scope>
      <report>
        <DQ_CompletenessOmission>
          <nameOfMeasure>
            <gco:CharacterString>Rate of missing items</gco:CharacterString>
          </nameOfMeasure>
          <measureIdentification>
            <MD_Identifier>
              <code>
                <gco:CharacterString>7</gco:CharacterString>
              </code>
            </MD_Identifier>
          </measureIdentification>
          <measureDescription>
            <gco:CharacterString>completeness omission (rec_grade)</gco:CharacterString>
          </measureDescription>
          <result>
            <DQ_QuantitativeResult>
              <valueUnit>
                <gml:UnitDefinition gml:id="unitDefinition_ID_bd34a84d-c3aa-44ff-9b6b-e9d8c18efbae">
                  <gml:identifier codeSpace=""/>
                  <gml:name>percent</gml:name>
                  <gml:quantityType>completeness omission</gml:quantityType>
                  <gml:catalogSymbol>%</gml:catalogSymbol>
                </gml:UnitDefinition>
              </valueUnit>
              <value>
                <gco:Record>DATEN_DEFIZIT</gco:Record>
              </value>
            </DQ_QuantitativeResult>
          </result>
        </DQ_CompletenessOmission>
      </report>
    </DQ_DataQuality>
  </dataQualityInfo>
</MD_Metadata>
```
