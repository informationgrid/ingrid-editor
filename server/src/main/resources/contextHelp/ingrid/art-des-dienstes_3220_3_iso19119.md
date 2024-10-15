---
# ID des GUI Elements
id: serviceType
docType: InGridGeoService
profile: ingrid

# title, used as window title
title: Art des Dienstes
---

# Art des Dienstes

In diesem Pflichtfeld kann die Art des Dienstes
ausgewählt werden.
Bei Auswahl des Wertes
"Download" wird die Option zur Bereitstellung als
ATOM-Download sichtbar.

Als Auswahlliste wird die Codeliste 5100 verwendet.

## Beispiel:

Darstellungsdienst (automatischer Eintrag "Technical Guidance for the implementation of INSPIRE View Services" in Konformität/Spezifikation)

# ISO Abbildung

Das Feld wird in ISO 19119 beschrieben. Es existiert keine deutsche Übersetzung.

## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <identificationInfo>
    <srv:SV_ServiceIdentification>
      <srv:serviceType>
        <gco:LocalName>[SERVICE_TYPE]</gco:LocalName>
      </srv:serviceType>
    </srv:SV_ServiceIdentification>
  </identificationInfo>
</MD_Metadata>
```
