---
# ID des GUI Elements
id: addresses
docType: BmiDoc
profile: bmi
---

Hier muss die *"Veröffentlichende Stelle"*, also der Datenbereitsteller (Institution, Firma, Behörde etc.) angegeben werden, der die Metadaten einträgt und über die Veröffentlichung entschieden hat.

Über den Link *„+ HINZUFÜGEN“* wird aus den Adressen für die Metadaten ausgewählt. Die entsprechende Adresse muss zuvor im Verzeichnisbaum unter *„Adressen“* angelegt worden sein und Sie müssen Leserechte auf diesen Adressen besitzen.<br />
Die Neueingabe von Adressen hier in diesem Feld ist nicht möglich.

**Das Feld *„Adressen“* muss ausgefüllt sein, damit der Datensatz veröffentlicht werden kann. Es muss genau eine *"Veröffentlichende Stelle"* vorliegen.**

Ansonsten können weitere Adressen verknüpft werden, z.B. als *"Urheber"* oder *"Ansprechpartner"*.

**HINWEIS**: Wird eine Adresse als *"Ansprechpartner"* hinzugefügt, so wird auch die Anschrift der Adresse veröffentlicht, ansonsten nur die Kontaktdaten wie E-Mail und URL.

### DCAT-AP.de
Die Abbildung nach *DCAT-AP.de* ist abhängig davon, in welcher Rolle die Adresse dem Metadatensatz hinzugefügt wird. Nachfolgend die verschiedenen Rollen und Ihre Abbildung.
* *Ansprechpartner*: `dcat:Dataset / dcat:contactPoint`
* *Veröffentlichende Stelle*: `dcat:Dataset / dcterms:publisher`
* *Autor*: `dcat:Dataset / dcterms:creator`
* *Urheber*: `dcat:Dataset / dcterms:originator`
* *Verwalter*: `dcat:Dataset / dcterms:maintainer`
