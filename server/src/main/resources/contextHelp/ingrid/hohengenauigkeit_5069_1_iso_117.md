---
# ID des GUI Elements
id: vertical
docType: InGridGeoDataset
profile: ingrid



# title, used as window title
title: Höhengenauigkeit
---

# Höhengenauigkeit

Angabe über die Genauigkeit der Höhe z.B. in einem Geländemodell.

## Beispiel:

2

# ISO Abbildung

Absolute Positionsgenauigkeit: Abweichung der Ist-Koordinaten von den Soll-Koordinaten

Domain: 117 (gmd:DQ_AbsoluteExternalPositionalAccuracy)

## Abbildung ISO 19139

```
<gmd:DQ_AbsoluteExternalPositionalAccuracy>
  <gmd:nameOfMeasure>
    <gco:CharacterString>Mean value of positional uncertainties (1D)</gco:CharacterString>
  </gmd:nameOfMeasure>
  <gmd:measureIdentification>
    <gmd:MD_Identifier>
      <gmd:code>
        <gco:CharacterString>28</gco:CharacterString>
      </gmd:code>
    </gmd:MD_Identifier>
  </gmd:measureIdentification>
  <gmd:measureDescription>
    <gco:CharacterString>vertical</gco:CharacterString>
  </gmd:measureDescription>
  <gmd:result>
    <gmd:DQ_QuantitativeResult>
      <gmd:valueUnit>
        <gml:UnitDefinition gml:id="unitDefinition_ID_[_GENERATED]">
          <gml:identifier codeSpace=""/>
          <gml:name>meter</gml:name>
          <gml:quantityType>absolute external positional accuracy, vertical accuracy</gml:quantityType>
          <gml:catalogSymbol>m</gml:catalogSymbol>
        </gml:UnitDefinition>
      </gmd:valueUnit>
      <gmd:value>
        <gco:Record>[Höhengenauigkeit]</gco:Record>
      </gmd:value>
    </gmd:DQ_QuantitativeResult>
  </gmd:result>
</gmd:DQ_AbsoluteExternalPositionalAccuracy>
```


