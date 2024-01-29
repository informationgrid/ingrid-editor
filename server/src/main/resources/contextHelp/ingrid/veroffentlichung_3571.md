---
# ID des GUI Elements
id: extraInfoPublishArea
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
title: Veröffentlichung
---

# Veröffentlichung

Das Feld Veröffentlichung gibt an, welche Veröffentlichungsmöglichkeiten für das Objekt freigegeben sind. Die Liste der Möglichkeiten ist nach Freigabestufen hierarchisch geordnet. Wird einem Objekt eine niedrigere Freigabestufe zugeordnet (z.B. von Internet auf Intranet), werden automatisch auch alle untergeordneten Objekte dieser Stufe zugeordnet. Soll einem Objekt eine höhere Freigabestufe zugeordnet werden als die des übergeordneten Objektes, wird die Zuordnung verweigert. Wird einem Objekt eine höhere Freigabestufe zugeordnet (z.B. von Amtsintern auf Intranet), kann auch allen untergeordneten Objekten die höhere Freigabestufe zugeordnet werden.

## Beispiel:

Die Einstellung haben folgende Bedeutung: Internet: Das Objekt darf überall veröffentlicht werden; Intranet: Das Objekt darf nur im Intranet veröffentlicht werden, aber nicht im Internet; Amtsintern: Das Objekt darf nur in der erfassenden Instanz aber weder im Internet noch im Intranet veröffentlicht werden.
