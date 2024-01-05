---
# ID des GUI Elements
id: resolution
docType: InGridGeoService

# title, used as window title
title: Erstellungsmaßstab
---

# Erstellungsmaßstab

Angabe des Erstellungsmaßstabes, der sich auf die erstellte Karte und/oder Digitalisiergrundlage bei Geodaten bezieht. Maßstab: Maßstab der Karte, z.B 1:12 Bodenauflösung: Einheit geteilt durch Auflösung multipliziert mit dem Maßstab (Angabe in Meter, Fließkommazahl) Scanauflösung: Auflösung z.B. einer eingescannten Karte, z.B. 120dpi (Angabe in dpi, Integerzahl) (optionales INSPIRE-Feld)

## Beispiel:

Bodenauflösung: Auflösungseinheit in Linien/cm; Einheit: z.B. 1 cm geteilt durch 400 Linien multipliziert mit dem Maßstab 1:25.000 ergibt 62,5 cm als Bodenauflösung

# ISO Abbildung

## Maßstab 1:x

Maßstabszahl: Angabe der Maßstabszahl (mz) eines Maßstabs 1 : mz

Domain: 57 (gmd:denominator)

## Bodenauflösung

Räumliche Auflösung: Angaben über die räumliche Auflösung der geografischen Informationen

Domain: 38 (gmd:spatialResolution)

```
<spatialResolution>
  <MD_Resolution>
    <distance>
      <gco:Distance uom="meter">12</gco:Distance>
    </distance>
  </MD_Resolution>
</spatialResolution>
```

## Scanauflösung

Räumliche Auflösung: Angaben über die räumliche Auflösung der geografischen Informationen

Domain: 38 (gmd:spatialResolution)

```
<spatialResolution>
  <MD_Resolution>
    <distance>
      <gco:Distance uom="dpi">300</gco:Distance>
    </distance>
  </MD_Resolution>
</spatialResolution>
```
