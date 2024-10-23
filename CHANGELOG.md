# Changelog

## 7.3.0 (01.10.2024)

### Features

- Synchronisation mit UVP Monitoring nachdem eine Veröffentlichung zurückgezogen wurde (#6768)
- IGE-NG Einführung ktlint check (#6750)
- URL Prüfung bei "Identifikator der Datenquelle" (#6715)
- "Datenquelle" beim Export hinzufügen (#6620)

### Bugfixes

- Fehler bei der Suche nach speziellen Zeichen (#6855)
- Schlagwort wird visuell nicht hinzugefügt (#6827)
- 'Verweise' dialog does not update the submit state on data change (#6826)
- Adding a new document to 'Dokumente' section does not appear immediately (#6824)
- A referenced address with same responsible cannot be added more than one time to the document (#6816)
- Kopieren von Verfahren mit archivierten Dateien unvollständig (#6787)
- Aktualisierung des Status der Adressreferenzen (#6780)
- Anzeige von "amtsinternen" MD bei den "Datenbezügen" einer Adresse (#6774)
- Hochgeladene entpackte ZIP-Dateien beim Veröffentlichen gelöscht (#6767)
- Import und export page ist nicht erreichbar für users mit gruppen ohne Folders bei den berechtigten Daten oder Adressen (#6752)
- Falscher Tooltip bei Adressen-Icons (#6747)
- Drag and Drop mehrzeilig verbessern (#6728)
- Abbildung Adresshierarchie mit mehreren Ebenen im Portal korrigieren (#6727)
- Error on publishing data collection document (#6717)
- 'Verweise' section is not updated after adding an entry and has wrong title in the dialog (#6691)
- Anzeige-Fehler bei den Verweisen (#6683)
- Fehler bei ISO-Schema-Validierung mit GDI Testsuite (#6660)
- Identifikator der Datenquelle wird fälschlicherweise automatisch erzeugt (#6641)
- Search using spatial title gives error (#6635)
- Fehler wenn Favorit bei "INSPIRE - priority data set" (#6579)
- Raumbezüge vom WMS 1.1.1 getCapabilities (#6566)

## 7.2.0 (08.07.2024)

### Features

- Veröffentlichungsrecht bei Referenzen während Veröffentlichung prüfen (#6482)
- Veröffentlichungsrecht - Warnung bei Änderung bei Adressen (#6458)
- Open Data - Checkbox und Portaldarstellung (#6454)
- Export-Funktionalität mit Mehrfachauswahl (#6437)
- Fertigstellung "Interne Schlüsselwörter" und "Geologische Schlüsselliste" (#6394)
- Anpassungen bei Nutzungsbedingungen (#6383)
- Mehrfachauswahl bei Export (#6382)
- Export "Bestellinformationen" nur nach intern (#6350)
- Funktion GetCapabilities Aktualisieren für Dienste herausnehmen (#6343)
- ISO-Ansicht im Editor (#6342)
- Open-Data Datensätze: optionale Angaben (#6334)
- Anpassung Export, Adressen vom Typ "Fachliche Ansprechstelle" (#6333)

### Bugfixes

- Falsche SQL für die Ermittlung der eingehenden Referenzen (#6474)
- Import von Adressen mit nicht existierender Uuid (#6463)
- Import von Personen legt Duplikate an (#6456)
- Fehler Indexierung und ISO-Ansicht (#6432)
- Datensatz aus anderem Katalog fehlt nach Import (#6429)
- Nächtliche Indexierung auf PROD läuft nicht (#6422)
- Fehler bei Export und Import eines Ordners (#6419)
- Bessere Handhabung von Filtern nach Katalogen über die InGrid Query (war: Indexfeld "iPlugId" muss kleingeschrieben werden.) (#6412)
- JSON-Validierungsfehler Freier Raumbezug (#6401)
- "Kartenlinks" werden nicht im Portal angezeigt (#6399)
- Hochgeladene Dateien werden gelöscht durch automatische Speicherung (#6386)
- Fehlermeldung bei Validierung "Medienoption" (#6380)
- Suche nach Projektnummer funktioniert nicht (#6348

## 7.1.0 (28.03.2024)

### Features

- "Dateiformat" Pflichtfeld für Typ "Datendownload" (#6145)
- Überarbeitung Portal-Layout / Teil 2 (#6112)
- Anpassungen Editor (#6077)
- IGE-NG, Exporter für internes/externes Portal (#6002)
- Konfigurierbarkeit der Karte verbessern (#5964)

### Bugfixes

- Keycloak erlaubt keine Leerzeichen im Loginnamen (#6130)
- ISO-Export für "HmbTG-Informationsgegenstand" unterschiedlich Classic / NG (#6126)
- "Open Data Kategorien", zwei Korrekturen (#6115)
- "Informationsgegenstand" verschwindet bei Speichern (OpenData-MD) (#6108)
- User aus Keycloak werden nicht im IGE-NG angezeigt (#6088)
- Anführungszeichen escapen bei "Quelle" (#6071)
- Feldzuordnung bei Adressen korrigieren (#6067)
- "Nach Ort suchen" im Portal funktioniert nicht (#6036)
- Aktualisierung sicherheitskritischer Libraries (#6018)
- Verweistypen sollen wenn nicht aus der ISO Liste kommend, als Type "information" abgegeben werden. (#6017)
- Tooltip shows 'undefined' when analyzing keywords and adding them to 'INSPIRE-Themen' (#6016)
- Löschung Account, Login in Bestätigungs-E-Mail fehlt (#5997)
- Leere Eingabe in Feld 'url' in der iBus Verwaltung Seite (#5990)
- Verantwortlicher beim Report "Abgelaufene Metadaten" verbessern (#5986)
- The activity report of UVP catalog shows wrong user (#5983)
- Reihenfolge der Organisationen bei Anzeige der Adressen umdrehen (#5981)
- Sprung vom Geodatensatz zum gekoppelten Dienst - Abfrage bei ungespeicherten Änderungen hinzufügen (#5979)
- Fehlermeldung nach Hinzufügen einer Adresse und Speichern erst bei Sprung zu Adressbereich (#5974)
- ' Zurücksetzen ' and ' Hinzufügen' buttons should be disabled in Codelist page when the item comes from Codelist-Repository (#5968)
- Kontexthilfe nicht eingebunden im Adressbereich (#5942)

## 7.0.0 (05.01.2024)

### Features

- Status wird über die Importfunktion nicht importiert (#5827)
- unklare Fehlermeldung beim Import einer XML Datei (#5826)
- Feld "Datenformat" für Verweise wieder einführen (#5744)
- Anzeige der "Abgelaufenen Metadaten" im Report ausblenden (#5743)
- Katalog: "Berechtigungen anzeigen" auch für Metadaten-Admin (#5718)
- Report Änderungen von Verfahren / neg. Vorprüfungen (insbesondere Löschung) (#5676)

### Bugfixes

- Geodatensatz kann ohne Pflichtfeld Zugriffsbeschränkungen veröffentlicht werden (#5815)
- Import in Ordner möglich, an denen man nicht berechtigt ist (#5814)
- Unklare Fehlmeldung bei XML Import (#5801)
- Titel Symbolkatalog und Schlüsselkatalog werden nicht ins ISO geschrieben (#5799)
- Druckvorschau beeinflusst Hauptformular (#5792)
- ISO-Export Konformität, ist das so richtig? (#5786)
- Anzeige (Koordinaten) der Raumbezüge unterschiedlich, Nominatim vs. wfs_gnde (#5784)
- gmd:hierarchyLevel für Datenserien richtig setzen (#5779)
- Capabilites-Assistent: Fehler bei der Veröffentlichung eines Eintrags zum Demokatalog CSW (#5761)
- Metadaten der Gemeindegrenzen können nicht als XML runtergeladen werden. (#5752)
- MD-Admin kann keine Benutzer löschen (#5746)
- Fehler Portalansicht bei MD aus IGE-NG (#5729)
- URL-Pflege funktioniert nicht im Geodatenkatalog Niederrhein (#5727)
- Fehler JSON-Validierung (#5722)
- ARS wird in Nominatim-Suche nicht mehr angezeigt (#5711)
- Beim Selektieren mehrerer Datensätze werden die verfügbaren Aktionen nicht korrekt ausgeblendet (#5703)
- GDI-Testsuite, Fehler (#5694)
- Systemumgebung wird nicht korrekt ins ISO geschrieben (#5682)
- Ordner dürfen nicht indiziert werden (#5681)

## 1.7.3 (13.12.2023)

### Bugfixes

- ARS wird in Nominatim-Suche nicht mehr angezeigt (#5711)
- IGE-NG: Nächtlicher Virusscan wird nicht ausgeführt (#5031)

## 1.7.1 (14.11.2023)

### Bugfixes

- GDI-Testsuite, Fehler (#5694)
- Systemumgebung wird nicht korrekt ins ISO geschrieben (#5682)
- Ordner dürfen nicht indiziert werden (#5681)
- Fehler GDI-Testsuite (#5671)

## 1.7.0 (09.11.2023)

### Features

- Auto-Save Popup manuell weg klicken (#5670)
- Icons - Bearbeitungsversion im Tooltip anzeigen (#5651)
- Parallelisieren der URL-Prüfung (#5606)
- Funktionsweise der Suche im Baum? (#5534)

### Bugfixes

- Feldzuordnung bei Adressen falsch? (#5672)
- Fehler GDI-Testsuite (#5671)
- Fehler ISO-Ansicht und Indexierung (#5666)
- IGE-NG - XML - gmd:MD_DigitalTransferOptions (#5663)
- METAVER - kommunaler Metadatenkatalog ST - Ordnerstruktur in den Adressen ist fehlerhaft (#5661)
- Fehlende Rechte auf Adressen (#5654)
- Fehler GDI-Testsuite gmd:MD_FeatureCatalogueDescription (#5653)
- Kommunaler Metadatenkatalog Sachsen-Anhalt - Fehlermeldung bei Datensatzverweis mit ID (#5643)
- Kommunaler Metadatenkatalog Sachsen-Anhalt - Hilfetexte fehlen (#5642)
- METAVER Portalsuche findet OpenData oder Open Data in der Verschlagwortung nicht (#5638)
- Gruppen eines Benutzers bei der Suche nicht katalogspezifisch (#5636)
- Darstellender Dienst, Kopplung fehlt in ISO (#5617)
- Partner Bezeichnung im METAVER Profil falsch (#5614)
- Raumbezug > Freie Eingabe: Geodätisches Datum unklar (#5602)
- DB-Transaktionsfehler bei Veröffentlichung von Datensatz mit vielen Referenzen (#5593)
- 'Verweise' section accept an email in the URL field for documents imported using getCapabilities assistant (#5583)
- Fehler GDI-Testsuite (#5574)
- Rechte in Menü rechts oben stimmen nicht mit Horizontal Menü überein und hat Zugriff auf Seite (#5541)
- Text bei Import reflektiert die Importmöglichkeit von ISO Dateien nicht (#5533)

## 1.6.0 (17.10.2023)

### Features

- Profil Kommunaler Datenkatalog ST - Konzeption und Umsetzung (#5285)
- IGE-NG: Nutzerliste - Sortierung nach Nachnamen anstatt Vornamen (#4244)

### Bugfixes

- ATOM-Feed-Client von ST lädt nicht (#5565)
- Fehler GDI-Testsuite für INSPIRE-Konformität (#5563)
- Hilfetext Zeitbezug angleichen (#5560)
- Capabilites-Assistent: Auswahl Adressordner nicht möglich (#5526)
- Im IGE-NG wird das Metadaten-Datum angezeigt (UVP Profil) (#5514)
- Bei Ingrid kommunal St Katalog tritt ein Fehler auf beim veröffentlichen von Geodatensatz (#5460)
- Messwerte Inhalte pflegen WB und Lasche: Pegel, ODL (#4290)

## 1.5.0 (27.09.2023)

### Features

- Adressverweise in Metadatensatz - min. 2 sind Pflicht! (#5459)
- Tooltipp über Icon in Formular ist nicht einheitlich (#5448)
- Reset datasets tree after deleting some datasets using multiple select delete (#5447)
- App-Screenbsp. für Konferenz-Poster UmweltNAVI (#5418)
- Sortierung im Baum (#5406)
- Separate Keycloak-URL für Frontend und Backend (#5386)

### Bugfixes

- JSON-Validierung, Fehler (#5545)
- URL-Prüfung: URL kann nicht ersetzt werden (#5542)
- Tabellen-Header wird beim Auswählen markiert (#5530)
- Images disappear in 'Vorschaugrafik' section after editing (#5517)
- Checkbox zeigt Tastatur-Fokus bei Mausklick (#5499)
- Indizierung in mehrere iBusse schlägt fehl (#5490)
- Veröffentlichungsrecht - falsche Farbe bei Ordnern (#5483)
- Vorschaugrafik - Dateiname - Umbruch (#5480)
- Fix 'Vorschaugrafik' dialog design (#5445)
- AdV-Produktgruppe erscheint auch in Klassen, die nicht AdV relevant sind (#5443)
- Wiedervorlage + Report - Verbesserungen Wording, Profil Verhalten etc. (#5409)
- Falsche Baumansicht bei Sprung aus Adress-Dashboard (#5407)
- "Verwaltungsgebiet" falscher Eintrag nach Import (#5402)
- Änderung der OpenStreetMap Nominatim URL (#5390)
- Funktion des Verantwortlichen deaktivieren (#5388)
- SQL-Suche läuft trotz Fehlermeldung weiter (#5380)
- Verhalten bei Löschung Codelisten-Eintrag oder Änderung ID (#5365)
- Optimistic Locking funktioniert nicht, Benutzer überschreibt geänderten Datensatz (#5362)
- Fehler bei Erfassung von Dienste-MD (#5349)

## 1.4.1 (19.07.2023)

### Bugfixes

- Es werden nicht alle Datensätze indiziert (#5339)
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
