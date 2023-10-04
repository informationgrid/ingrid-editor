---
# ID des GUI Elements
id: resourceTime
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
title: Zeitbezug des Dateninhalts
---

# Zeitbezug des Dateninhalts

Hier soll die Zeitspanne oder der Zeitpunkt der Erhebung
der eigentlichen Daten (z.B. Messdaten) eingetragen werden.
Ein Zeitpunkt wird mit "am" im Auswahlmenü angegeben.
Die Zeitspanne kann auf unterschiedliche Weise
ausgedrückt werden. Zur Auswahl stehen:


| Auswahl&nbsp;1 | Auswahl 2                  | Bedeutung                                                                                                                                                                                                                                                                                           |
|----------------|----------------------------|-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------| 
| am             |                            | Angabe eine Zeitpunktes                                                                                                                                                                                                                                                                             |
| bis            |                            | Nur das Ende der Zeitspanne ist bekannt. Anstelle einer konkreten Datumsangabe für den Beginn der Zeitspanne erfolgt "unknown".                                                                                                                                                                     |
| von            | bis: gegenwärtige Aktualität unklar | Nur der Beginn der Zeitspanne ist bekannt. Das Ende der Zeitspanne ist unbekannt und kann in der Vergangenheit, Gegenwart oder Zukunft liegen. Anstelle einer konkreten Datumsangabe für das Ende der Zeitpanne erfolgt der Eintrag "unknown".                                                      |
| von            | bis: gegenwärtig aktuell  | Für Ressourcen, deren Datenbestand fortlaufend in kurzen regelmäßigen Zeitabschnitten aktualisiert oder angereichert wird. Das Ende der Zeitspanne entspricht dem Zeitpunkt des Abrufs der Ressource. Anstelle einer konkreten Datumsangabe für des Ende der Zeitpanne erfolgt der Eintrag "now".   |
| von            | bis: genaues Datum         | Beginn und Ende der Zeitspanne sind bekannt.                                                                                                                                                                                                                                                        |

# ISO Abbildung

Zeitliche Ausdehnung: zeitliche Komponente der Ausdehnung des betreffenden Objekts

Domain: 337 (gmd:temporalElement)

