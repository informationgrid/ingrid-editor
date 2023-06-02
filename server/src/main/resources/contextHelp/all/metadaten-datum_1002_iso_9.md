---
# ID des GUI Elements
id: modifiedMetadata
docType: all

# title, used as window title
title: Metadaten-Datum (veröffentlichte Version)
---

# Metadaten-Datum der veröffentlichten Version

Datum, zu dem der Metadatensatz veröffentlicht wurde. Dieses Datum wird immer dann aktualisiert, wenn ein Metadatensatz **veröffentlicht** wird und dieser sich **geändert** hat.

Die **Änderung eines Metadatensatzes** wird anhand der Änderung von Inhalt und Struktur erkannt. Dazu wird ein Fingerabdruck der ISO 19139 XML Daten erstellt und gespeichert. Das Metadaten-Datum wird nur aktualisiert, wenn sich bei einer Veröffentlichung auch der Fingerabdruck ändert.

Dadurch wird sichergestellt, dass das Metadaten-Datum auch nicht-inhaltliche Änderungen reflektiert, die sich z.B. durch eine Anpassung der Struktur des Metadatensatzes ergibt. Dies ist wichtig, weil nachfolgende Systeme sich auf dieses Datum beziehen, um z.B. geänderte Metadatensätze zu ermitteln.

# ISO Abbildung

Datum, zu dem der Metadatensatz erzeugt/geändert wurde.

Domain: 9 (gmd:dateStamp)

## Abbildung ISO 19139 XML

```XML
<MD_Metadata>
  <gmd:dateStamp>
    <gco:Date>2020-01-15</gco:Date>
  </gmd:dateStamp>
</MD_Metadata>
```
