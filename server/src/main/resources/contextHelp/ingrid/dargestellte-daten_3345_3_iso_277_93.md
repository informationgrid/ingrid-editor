---
# ID des GUI Elements
id: shownData
docType: InGridGeoService
profile: ingrid


# title, used as window title
title: Dargestellte Daten
---

# Dargestellte Daten

Herkunft und Art der zugrundeliegenden Daten. Bei einem OGC Web Service können Verweise auf ein oder mehrere Geodatensätze eingefügt werden, die mit dem Dienst verknüpft sind. Im Allgemeinen sind dies die Datensätze, auf die der Dienst aufgesetzt ist. Allgemein sollen die Herkunft oder die Ausgangsdaten der Daten beschrieben werden, die in dem Dienst benutzt, werden.

Als bevorzugte Methode können über "Gekoppelte Daten auswählen" Geodatensätze aus dem gleichen Katalog ausgewählt werden oder externe Metadatensätze über einen GetRecordsByID HTTP-GET-Request referenziert werden. Bei der Angabe eines GetRecordsByID HTTP-GET-Request wird die Resource analysiert und zusätzlich noch der Titel und der Resource-Identfier ermittelt und gespeichert.

Die Angabe eines Textes beschreibt die dargestellten Daten in Form eines Textes. Zusätzlich kann hier auch  die Art der Daten (z. B. digital, automatisch ermittelt oder aus Umfrageergebnissen, Primärdaten, fehlerbereinigte Daten) angegeben werden.

Ist die Option "Als ATOM-Download Dienst bereitstellen" ausgewählt, so muss darauf geachtet werden, dass die extern verkoppelten dargestellten Daten einen Downloadlink besitzen.

## Beispiel:

Messdaten von Emissionen in bestimmten Betrieben bzw. Einfügen eines Verweises auf den "tightly coupled" OGC Web-Dienst

# ISO Abbildung

Bei Angabe eines Geodatensatzes wird die Abbildung auf ```<srv:operatesOn uuidref="UUID_OF_COUPLED_DATASET">``` (ISO 19119) vorgenommen.

Bei Angabe eines GetRecordsByID HTTP-GET-Requests wird die Abbildung auf ```<transferOptions><MD_DigitalTransferOptions><onLine>``` (Domain: 277) vorgenommen. Es wird der Link (Domain: 397), der Titel (Domain: 400) und der Resource-Identifier (Domain: 401) abgebildet.

Bei Angabe eines Textes wird dieser auf ```<LI_Source><description>``` (Domain: 93) abgebildet.
