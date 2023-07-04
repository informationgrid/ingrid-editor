---
# ID des GUI Elements
id: Datum
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
title: Vertikaldatum
---

# Vertikaldatum

Angabe des Referenzpegels, zu dem die Höhe relativ gemessen wird. In Deutschland ist dies i.A. der Pegel Amsterdam.

## Beispiel:

Pegel Amsterdam

# ISO Abbildung

Vertikales Bezugssystem: Angabe des Höhenbezugssystems, in dem der tiefste und der höchste Punkt angegeben sind. Das Höhenbezugssystem beinhaltet die Angabe einer Maßeinheit.

Domain: 358 (gmd:verticalCRS)


```XML
<MD_Metadata>
  <identificationInfo>
    <MD_DataIdentification>
      <extent>
        <EX_Extent>
          <verticalElement>
            <verticalCRS>
              <gml:VerticalCRS gml:id="[_RANDOM]">
                <gml:identifier codeSpace=""/>
                <gml:scope/>
                <gml:verticalCS>
                  <gml:VerticalCS gml:id="[_RANDOM]">
                    <gml:identifier codeSpace=""/>
                    <gml:axis>
                      <gml:CoordinateSystemAxis gml:id="[_RANDOM]" gml:uom="[HOEHE_MASSEINHEIT]">
                        <gml:identifier codeSpace=""/>
                        <gml:axisAbbrev/>
                        <gml:axisDirection codeSpace=""/>
                      </gml:CoordinateSystemAxis>
                    </gml:axis>
                  </gml:VerticalCS>
                </gml:verticalCS>
                <gml:verticalDatum>
                  <gml:VerticalDatum gml:id="[_RANDOM]">
                    <gml:identifier codeSpace=""/>
                    <gml:name>[VERTIKAL_DATUM]</gml:name>
                    <gml:scope/>
                  </gml:VerticalDatum>
                </gml:verticalDatum>
              </gml:VerticalCRS>
            </verticalCRS>
          </verticalElement>
        </EX_Extent>
      </extent>
    </MD_DataIdentification>
  </identificationInfo>
</MD_Metadata>
```
