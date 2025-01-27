---
# ID des GUI Elements
id: regionKey
docType: all

# title, used as window title
title: Regionalschlüssel
---

# Regionalschlüssel

Der amtliche Regionalschlüssel (ARS) des Statistischen Bundesamtes dient als ergänzende Angabe zur BoundingBox und präzisiert die Beschreibung der räumlichen Ausdehnung einer Geodatenressource. Es sind nur jene Ziffern des ARS anzugeben, die die jeweilige administrative Ebene abbilden:

- Gemeinde: alle 12 Stellen des ARS sind erforderlich
- Gemeindeverband: die ersten 9 Stellen des ARS sind anzugeben
- Bundesland: die ersten 2 Stellen des ARS sind ausreichend
- Nationalstaat 'Bundesrepublik Deutschland':  die Eingabe einer einzigen '0' ist ausreichend. Für die Ausgabeformate (ISO-XML, Portal uvm.) wird der Wert automatisch auf 12 Stellen ('000000000000') vervollständigt.

Der Regionalschlüssel sollte nur angegeben werden, wenn der geometrische Umring einer administrativen Einheit zutreffend ist und die Geodatenressource vollständig darin liegt.

Ein interaktives Tool zur Suche nach Amtlichen Regionalschlüsseln finden Sie unter https://opengovtech.de/ars/.
