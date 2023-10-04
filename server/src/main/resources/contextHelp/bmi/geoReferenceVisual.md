---
# ID des GUI Elements
id: spatial
docType: BmiDoc
profile: bmi
---

Einen geografischen Bezug können Sie durch drei unterschiedliche Raumbezugssysteme erstellen:<br />

## Freier Raumbezug
Der "Freie Raumbezug" wird auf einer Karte festgelegt. Eine Ortssuche kann verwendet werden, um den Raumbezug ortsbezogen auszuwählen.

## Raumbezug (WKT)
Die Erfassung eines Raumbezuges als Well Known Text (WKT, https://en.wikipedia.org/wiki/Well-known_text_representation_of_geometry) ermöglicht die freie Angabe von geometrischen Gebilden.<br />
**Unterstützt werden momentan nur Polygone mit einer Außengrenze und Innengrenzen (Löcher), Points und Linestrings.**

Beispiel:
>  POLYGON((0 0, 0 10, 10 10, 10 0, 0 0),(5 5, 5 7, 7 7, 7 5, 5 5))  
>  POINT(10 10)  
>  LINESTRING (10 10, 20 20, 30 40)  

## Nur Titel
Geben Sie die geographische Bezeichnung oder auch den Eigennamen des Raumbezugs an.
