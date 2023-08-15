# Changelog

## 1.4.2 (15.08.2023)

### Bugfixes

- Anpassung der Nominatim URL-Struktur (#5390)

## 1.4.1 (19.07.2023)

### Bugfixes

- Uploads werden durch den Aufräum-Job gelöscht (#5337)
- Indizierung stoppt nicht (#5336)

## 1.4.0 (11.07.2023)

### Features

- Vervollständigung der Unit-Tests für Export aller Typen (#5283)
- Kennzeichnung Veröffentlichungsrecht im Baum (#5225)
- "Optionale Schlagworte" aufteilen (#5221)
- Vorschaugrafik - Verbesserungen (#5220)
- Hilfetexte GEMET und UMTHES ergänzen (#5218)
- Geo-Thesaurus: Suchbegriffe mit \*? (#5213)
- Verweise - Komponente austauschen (#5211)
- Eingaben in Datengrundlage/Herstellungsprozess werden nicht automatisch übernommen (#5194)
- ISO Vorschau soll kopierbar sein (#5187)

### Bugfixes

- URL als ungültig erkannt (#5303)
- Capabilites-Assistent: Koordinaten werden vertauscht (#5299)
- Ansprechpartner MD verpflichten (#5282)
- "Erläuterungen zum Zeitbezug" - falscher Hilfetext (#5272)
- Datensatz enthält Daten aus zuvor geladenen Datensatz (#5266)
- Verweis-Typ: "Basisdaten" taucht zweimal auf (#5260)
- Löschung einer Adresse die in Datensätzen referenziert wird (#5250)
- Manche Toolbar Icons erscheinen nicht bei einem Direkteinsprung (#5244)
- Tooltip bei Adresse mit Bearbeitungskopie fehlt (#5242)
- Vorschau - diverse Fehler beheben (#5237)
- "Zugang geschützt" - Verhalten bei Aktivierung? (#5236)
- PORTAL / Export, diverse Fehler beheben und Unit-Tests (#5235)
- Kopieren eines MD - Identifikator der Datenquelle löschen (#5234)
- ARS - Feld leeren bei Wechsel zwischen versch. Raumbezugstypen? (#5229)
- UX/UI: Verbesserungen, Behebung von Fehlern (#5219)
- Capabilities-Assistent: Berechtigung Adresse (#5212)

## [1.2.0] - 2023-01-18

### Added

- URL Check reporter (#3087)
- Autosave-Plugin (#2897)
- Add warning indicator on indexing page (#4128)
- Add reset option for facets on reserarch page
- Show catalog-ID in URL

### Changed

- Increase title column size in database
- Improved styles and layout
- Update libraries (Angular 15)

### Fixed

- Spatial dialog title (#4025)
- Indexing multiple catalogs at the same time
- Send correct iPlug/catalog configuration as plugdescription to iBus
- Allow login names with special characters
- Fix cancellation of indexing (#4501)
- Fix UVP report (#4384)

### Security

## [1.0.1] - 2022-07-22

### Changed

- Add more fields to index to be searched on.

### Fixed

- Partner and provider not added to PlugDescription
- Fix export of eia numbers
- Fix changing email and name on profile page
- Fix handling of eia numbers with no category

## [1.0.0] - 2022-07-22

### Added

- Profile for UVP
- UVP report
- Export of datasets to IDF
- Replace address functionality
- Organizations can contain persons
- Notifications for users on dashboard

### Changed

- Improve selection of spatial references

### Deprecated

### Removed

### Fixed

### Security

## [0.9.0] - 2021-11-10

### Added

- Introduce separate pages for data and addresses
- Info about version
- User menu
- Show session timeout
- mCLOUD Profile
- Form
  - Load / Save / Publish / Revert / Delete of a document / address
  - Copy / Cut tree nodes
  - Drag'n'Drop tree nodes to move documents / addresses
  - History to navigate between opened documents / addresses
- Dashboard
  - Quick search
  - Latest edited documents
  - Graphical statistic of documents
- Export
  - Internal format
  - mCLOUD

### Changed

### Deprecated

### Removed

### Fixed

### Security
