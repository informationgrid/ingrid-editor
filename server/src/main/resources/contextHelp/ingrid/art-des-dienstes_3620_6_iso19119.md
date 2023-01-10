---
# ID des GUI Elements
id: serviceType
docType: InGridInformationSystem
profile: ingrid



# title, used as window title
title: Art des Dienstes
---

# Art des Dienstes

In diesem Feld muss die Art des Dienstes ausgewählt werden. Es stehen folgende Einstellungen zur Verfügung: "Informationssystem", "nicht geographischer Dienst" und "Anwendung". Sollte es sich bei Ihrem Dienst um einen geographischen Dienst handeln, wählen Sie bitte in dem dafür vorgesehenen Feld "Objektklasse" die Einstellung  "Geodatenklasse" aus.

Als Auswahlliste wird die Codeliste 5300 verwendet. 


## Beispiel:

"Informationssystem"; "nicht geographischer Dienst"; "Anwendung"

# ISO Abbildung

Das Feld wird in ISO 19119 beschrieben. Es existiert keine deutsche Übersetzuuung. 

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
