---
# ID des GUI Elements
id: subType
docType: InGridGeoDataset
profile: ingrid



# title, used as window title
title: Datensatz/Datenserie
---

# Datensatz/Datenserie

Auswahl, ob es sich bei den beschriebenen Daten um einen einzelnen Datensatz mit bestimmtem räumlichen Bezug oder um eine Datenserie mit einheitlichem thematischen Bezug und mehreren Datensätzen mit unterschiedlichem räumlichen Bezug (z.B. Datenserie: DTK25) handelt.

## Beispiel:

Datensatz

# ISO Abbildung

Je nach Auswahl wird `gmd:hierarchyLevel` (Bereich, auf den sich die Metadaten beziehen, weitere Informationen zu Hierarchieebenen sind dem ISO 19115 - Anhang H  zu entnehmen. Domain 6) und `gmd:hierarchyLevelName` (Bezeichnung der Hierarchieebene, auf die sich die Metadaten beziehen. Domain 7) gesetzt:


| Datensatz/Datenserie&nbsp;&nbsp; | gmd:hierarchyLevel&nbsp;&nbsp; | gmd:hierarchyLevelName   |
| -------------------------------- |:------------------------------:| :-----------------------:|
| Datensatz            | "dataset"          | <ELEMNT NICHT VORHANDEN> |
| Datenserie           | "series"           | "series"                 |
