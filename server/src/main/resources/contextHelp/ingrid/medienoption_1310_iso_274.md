---
# ID des GUI Elements
id: digitalTransferOptions
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
title: Medienoption
---

# Medienoption

Angabe, auf welchen Medien die Daten zur Verfügung gestellt werden können. Hier können elektronische Datenträger als auch Medien in Papierform angegeben werden, auf denen die im Objekt beschriebenen Daten dem Nutzer zur Verfügung stehen. Es können mehrere Medien eingetragen werden. Medium: Angabe der Medien, auf denen der Datensatz bereit gestellt werden kann (ISO-Auswahlliste) Datenvolumen: Umfang des Datenvolumens in MB (Fließkommazahl) Speicherort: Ort der Datenspeicherung im Intranet/Internet, Angabe als Verweis

## Beispiel:

Medium: CD-ROM Datenvolumen: 700 MB Speicherort: Explorer Z:/Bereich_51/Metainformation/20040423_Hilfetexte.doc

# ISO Abbildung

Die Tabelle wird auf das ISO Element MD_DigitalTransferOptions (274) abgebildet.

## Name

Bezeichnung: Bezeichnung des Mediums, auf dem die Ressource erhältlich ist

Domain: 292 (gmd:name)

## Datenvolumen (MB)

Transfergröße: geschätzte Größe einer Einheit im jeweiligen Abgabeformat, angegeben in Megabyte. Die Transfergröße ist > 0.0

Domain: 276 (gmd:transferSize)

## Speicherort

Anmerkung: Beschreibung anderer Beschränkungen oder Voraussetzungen, um das Medium zu nutzen

Domain: 297 (gmd:mediumNote)
