---
# ID des GUI Elements
id: conformanceResult
docType:
  - InGridGeoDataset
  - InGridGeoService
profile: ingrid

# title, used as window title
title: Konformität
---

# Konformität

<p>Hier kann angegeben werden, zu welcher Spezifikation die beschriebenen Daten konform sind.</p><p>Einträge in dieses Feld erfolgen über den Link "Konformität hinzufügen". Es ist möglich aus Vorgabelisten auszuwählen oder freie Eingaben zu tätigen.</p><p>Sind die zu beschreibenden Daten INSPIRE-relevant, muss die zutreffende Durchführungsbestimmung der INSPIRE-Richtlinie angegeben werden. (INSPIRE-Pflichtfeld)</p><p>Dieses Feld wird bei Eintragungen in "INSPIRE-Themen" oder "Art des Dienstes" automatisch befüllt. Es muss dann nur der "Grad der Konformität" manuell angepasst werden.</p><p>Bei Aktivierung der Checkbox "AdV kompatibel":<br />Bitte entsprechend den Empfehlungen des AdV-Metadatenprofils nur die Werte "konform" und "nicht konform" für "Grad der Konformität" verwenden.</p>
<p>Das Feld "geprüft mit" ist im Editor eine optionale Angabe, laut der ISO ist es aber verpflichtend, wenn eine Konformität angegeben wird. Deswegen wird in der ISO-Ausgabe das folgende Element mit ausgegeben, wenn keine Eingabe bei "geprüft mit" erfolgt ist:</p>

```XML
<gmd:explanation>
  <gco:CharacterString>see the referenced specification</gco:CharacterString>
</gmd:explanation>
```

# ISO Abbildung

Konsistenz des Wertebereichs: Einhaltung der Werte in Wertebereichen

Domain: 113 (DQ_DomainConsistency)
