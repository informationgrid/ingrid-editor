---
# ID des GUI Elements
id: isInspireIdentified
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
title: INSPIRE-relevanter Datensatz
---

# INSPIRE-relevanter Datensatz

<p>Dieses Feld definiert, wenn aktiviert, dass ein Metadatensatz für das INSPIRE-Monitoring vorgesehen ist.</p><p>Folgende Eigenschaften ändern sich bei Aktivierung:</p><ul><li>Hinzufügen des Schlagwortes "inspireidentifiziert" bei ISO XML Generierung</li><li>verpflichtende Angabe eines INSPIRE Themas bei Klasse "Anwendung" (6)</li><li>WebServices wird als Defaultwert für die unterstützte Plattform bei einer neuen Operation verwendet</li><li>"Konformität" wird zu einem Pflichteingabe gemacht. "Konformität"-Tabelle wird sichtbar gemacht und ein Standardeintrag wird in diese Tabelle hinzugefügt.</li></ul>

# INSPIRE-relevant konform

Geodatensatz wird an INSPIRE gemeldet und liegt im INSPIRE-DatenSchema vor. Der Grad der Konformität zur Spezifikation (VO 1089/2010) wird auf "true" gesetzt.

# INSPIRE-relevant nicht konform

Geodatensatz wird an INSPIRE gemeldet, liegt aber nicht im INSPIRE-DatenSchema vor. Der Grad der Konformität zur Spezifikation (VO 1089/2010) kann durch den Anwender nur auf "false" oder "nicht evaluiert" gesetzt werden.
