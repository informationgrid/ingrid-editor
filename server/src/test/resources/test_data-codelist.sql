TRUNCATE TABLE document RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_wrapper RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_archive RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog_user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE behaviour RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog RESTART IDENTITY CASCADE;

-- catalogs
INSERT INTO catalog VALUES (100, 'test_catalog', 'ingrid', 'Test Catalog', 'Test Catalog Description', now(), now(), NULL);

-- users
INSERT INTO user_info VALUES (10, 'user1', NULL, '{"recentLogins": [1604100256021]}');
INSERT INTO catalog_user_info VALUES (100, 10);

-- documents and wrappers

-- published version
INSERT INTO document
VALUES (1001, 100, 'uuid-1', 'InGridGeoService', 'Anonymized Title', '{
  "title": "full_geodatendienst",
  "properties": {
    "isInspireIdentified": "relevant"
  },
  "description": "test",
  "graphicOverviews": [],
  "pointOfContact": [
    {
      "ref": "826cd85e-9b65-43f6-b2a7-3f20b57450f4",
      "type": {
        "key": "12"
      }
    },
    {
      "ref": "83f92167-6606-4182-948c-5747ad608b80",
      "type": {
        "key": "7"
      }
    }
  ],
  "advProductGroups": [
    {
      "key": "0"
    }
  ],
  "keywords": {
    "gemet": [],
    "umthes": [],
    "free": []
  },
  "service": {
    "classification": [
      {
        "key": "303"
      }
    ],
    "type": {
      "key": "3"
    },
    "version": [
      {
        "key": "2"
      }
    ],
    "operations": [
      {
        "name": {
          "key": "2"
        },
        "description": "test",
        "methodCall": "https://www.cypress.io/"
      }
    ],
    "coupledResources": [],
    "resolution": [],
    "hasAccessConstraints": false,
    "isAtomDownload": true
  },
  "spatial": {
    "references": [
      {
        "ars": "",
        "type": "free",
        "title": "TE, Lübecker Straße, Altstadt, Schwerin, Mecklenburg-Vorpommern, 19053, Deutschland (clothes)",
        "value": {
          "lat1": 53.6279788,
          "lat2": 53.6280788,
          "lon1": 11.409222,
          "lon2": 11.409322
        }
      }
    ],
    "spatialSystems": [
      {
        "key": "84"
      }
    ],
    "verticalExtent": {
      "minimumValue": 1,
      "maximumValue": 11,
      "unitOfMeasure": {
        "key": "9036"
      },
      "Datum": {
        "key": "900002"
      }
    }
  },
  "temporal": {
    "events": [
      {
        "referenceDate": "2023-07-31T22:00:00.000Z",
        "referenceDateType": {
          "key": "1"
        }
      }
    ],
    "resourceDateType": {
      "key": "at"
    },
    "status": {
      "key": "6"
    }
  },
  "maintenanceInformation": {
    "maintenanceAndUpdateFrequency": {
      "key": "11"
    },
    "userDefinedMaintenanceFrequency": {
      "number": 1,
      "unit": {
        "key": "5"
      }
    }
  },
  "metadata": {
    "language": {
      "key": "150"
    }
  },
  "conformanceResult": [
    {
      "pass": {
        "key": "1"
      },
      "isInspire": true,
      "specification": {
        "key": "10"
      },
      "publicationDate": "2009-10-20T00:00:00.000Z"
    }
  ],
  "extraInfo": {
    "legalBasicsDescriptions": [{"key": "60"}]
  },
  "resource": {
    "accessConstraints": [
      {
        "key": "2"
      }
    ],
    "useConstraints": [
      {
        "title": {
          "key": "2"
        }
      }
    ]
  },
  "distribution": {
    "format": [
      {
        "name": {
          "key": "2"
        }
      }
    ]
  },
  "digitalTransferOptions": [
    {
      "name": {
        "key": "4"
      },
      "transferSize": {
        "unit": {
          "key": "MB"
        }
      }
    }
  ],
  "references": [
    {
      "url": "https://test.com/my.zip",
      "type": {
        "key": "9990"
      },
      "title": "Daten zum Download",
      "urlDataType": {
        "key": "27"
      },
      "referenceType": "url"
    }
  ],
  "spatialScope": {
    "key": "827891363"
  },
  "themes": [
    {
      "key": "317"
    }
  ],
  "priorityDatasets": [
    {
      "key": "-1021374392"
    }
  ]
}',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'PUBLISHED')
;
INSERT INTO document
VALUES (1002, 100, 'uuid-2', 'InGridGeoService', 'Anonymized Title negative', '{}',
        0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'PUBLISHED')
;

INSERT INTO document_wrapper VALUES (1, 100, null, 'uuid-1', 'InGridGeoService', 'data', 0);
INSERT INTO document_wrapper VALUES (2, 100, null, 'uuid-2', 'InGridGeoService', 'data', 0);

INSERT INTO codelist VALUES (1,1350,100,'Rechtliche Grundlagen','','[{"id": "1", "localisations": {"de": "Atomgesetz (AtG)"}}, {"id": "2", "localisations": {"de": "Baugesetzbuch (BauGB)"}}, {"id": "3", "localisations": {"de": "Bürgerl. Gesetzbuch (BGB)"}}, {"id": "4", "localisations": {"de": "Bodenschutzgesetz (BodSchG)"}}, {"id": "5", "localisations": {"de": "Bundesberggesetz (BBergG)"}}, {"id": "7", "localisations": {"de": "Bundesnaturschutzgesetz (BNatSchG)"}}, {"id": "8", "localisations": {"de": "Bundeswaldgesetz (BundeswaldG)"}}, {"id": "9", "localisations": {"de": "Chemikaliengesetz (ChemG)"}}, {"id": "10", "localisations": {"de": "Flurbereinigungsgesetz (FlurbG)"}}, {"id": "11", "localisations": {"de": "Gentechnikgesetz (GenTG)"}}, {"id": "13", "localisations": {"de": "Kreislaufwirtschafts- u. Abfallgesetz (KrW-/AbfG)"}}, {"id": "14", "localisations": {"de": "Landesabfallgesetz (LAbfG)"}}, {"id": "15", "localisations": {"de": "Landesabfallwirtschaftsgesetz (LAbfWG)"}}, {"id": "16", "localisations": {"de": "Landschaftsgesetz (LG)"}}, {"id": "17", "localisations": {"de": "Pflanzenschutzgesetz (PflSchG)"}}, {"id": "18", "localisations": {"de": "Raumordnungsgesetz (ROG)"}}, {"id": "19", "localisations": {"de": "Strahlenschutzvorsorgegesetz (StrVG)"}}, {"id": "20", "localisations": {"de": "Tierschutzgesetz (TierSchG)"}}, {"id": "21", "localisations": {"de": "Umwelthaftungsgesetz (UmweltHG)"}}, {"id": "22", "localisations": {"de": "Umweltinformationsgesetz (UIG)"}}, {"id": "23", "localisations": {"de": "Verwaltungsverfahrensgesetz (VwVfG)"}}, {"id": "24", "localisations": {"de": "Bundeswasserstraßengesetz (WaStrG)"}}, {"id": "25", "localisations": {"de": "Wasserhaushaltsgesetz (WHG)"}}, {"id": "26", "localisations": {"de": "Umweltstatistikgesetz (Fass. 21.06.1994)"}}, {"id": "27", "localisations": {"de": "Umweltstatistikgesetz (Fass. 14.03.1980)"}}, {"id": "29", "localisations": {"de": "Trinkwasserverordnung (TrinkwV)"}}, {"id": "30", "localisations": {"de": "TA Siedlungsabfall"}}, {"id": "31", "localisations": {"de": "TA Abfall"}}, {"id": "32", "localisations": {"de": "Strahlenschutzverordnung (StrlSchVO)"}}, {"id": "33", "localisations": {"de": "Richtl. Em.- u. Im.-Überwachung. kerntech. Anl."}}, {"id": "34", "localisations": {"de": "RdErl. d. ML v. 16.1.1986, GültL 10/66"}}, {"id": "35", "localisations": {"de": "Nieders. Wassergesetz (NWG)"}}, {"id": "36", "localisations": {"de": "Nieders. Naturschutzgesetz (NNatG)"}}, {"id": "38", "localisations": {"de": "Nieders. Abfallgesetz (NAbfG)"}}, {"id": "39", "localisations": {"de": "Nieders. Deichgesetz (NDG)"}}, {"id": "40", "localisations": {"de": "Nieders. Abfallgesetz. 6. Teil \"Altlasten\""}}, {"id": "41", "localisations": {"de": "Nieders. Abfallabgabengesetz"}}, {"id": "42", "localisations": {"de": "Landesraumordnungsprogramm LROP"}}, {"id": "43", "localisations": {"de": "KTA 1508"}}, {"id": "45", "localisations": {"de": "Gesetz über eine Holzstatistik"}}, {"id": "46", "localisations": {"de": "Ges. Statistik im Produzierenden Gewerbe"}}, {"id": "47", "localisations": {"de": "Gesetz ü. d. Umweltverträglichkeitsprüfung (UVPG)"}}, {"id": "48", "localisations": {"de": "Erlaß Nds. Umweltministerium vom 16.10.1992"}}, {"id": "49", "localisations": {"de": "Bundesimmissionsschutzgesetz (BImSchG)"}}, {"id": "50", "localisations": {"de": "BImSchG §47a"}}, {"id": "51", "localisations": {"de": "Arbeitsschutzgesetz"}}, {"id": "52", "localisations": {"de": "Anleitung zur Berechnung von Fluglärm"}}, {"id": "53", "localisations": {"de": "Agrarstatistikgesetz (AgrStatG)"}}, {"id": "54", "localisations": {"de": "Abfallklärschlammverordnung (AbfKlärV)"}}, {"id": "55", "localisations": {"de": "Bundesimmissionsschutzverordnung, 23."}}, {"id": "56", "localisations": {"de": "Abwasserabgabengesetz (AbwAG)"}}, {"id": "57", "localisations": {"de": "Wasserhaushaltsgesetz (WHG) § 7a"}}, {"id": "58", "localisations": {"de": "§ 152 NWG (Abwasserbeseitigungspläne)"}}, {"id": "59", "localisations": {"de": "§ 52 Nieders. Wassergesetz (NWG)"}}, {"id": "60", "localisations": {"de": "§ 67 NWG"}}, {"id": "61", "localisations": {"de": "23. Bundesimmissionsschutzverordnung"}}, {"id": "62", "localisations": {"de": "Abfallgesetz (AbfG)"}}, {"id": "63", "localisations": {"de": "AdV-Plenumsbeschluß von 1994"}}, {"id": "64", "localisations": {"de": "AdV-Plenumsbeschluß von1994"}}, {"id": "65", "localisations": {"de": "Agrarstatistikgesetz AgrStatG"}}, {"id": "67", "localisations": {"de": "Betriebssatzung der LGN v. 7.7.1997"}}, {"id": "68", "localisations": {"de": "Bundesimmissionsschutzverordnung"}}]');
INSERT INTO codelist VALUES (2,3390,100,'Ressourcen-Typ (generell)','Die Liste der generellen Ressourcentypen ist übernommen von https://datacite-metadata-schema.readthedocs.io/en/4.5/properties/resourcetype/#a-resourcetypegeneral','[{"id": "1", "localisations": {"de": "Audiovisual", "en": "Audiovisual"}}, {"id": "2", "localisations": {"de": "Book", "en": "Book"}}, {"id": "3", "localisations": {"de": "BookChapter", "en": "BookChapter"}}, {"id": "4", "localisations": {"de": "Collection", "en": "Collection"}}, {"id": "5", "localisations": {"de": "ComputationalNotebook", "en": "ComputationalNotebook"}}, {"id": "6", "localisations": {"de": "ConferencePaper", "en": "ConferencePaper"}}, {"id": "7", "localisations": {"de": "ConferenceProceeding", "en": "ConferenceProceeding"}}, {"id": "8", "localisations": {"de": "DataPaper", "en": "DataPaper"}}, {"id": "9", "localisations": {"de": "Dataset", "en": "Dataset"}}, {"id": "10", "localisations": {"de": "Dissertation", "en": "Dissertation"}}, {"id": "11", "localisations": {"de": "Event", "en": "Event"}}, {"id": "12", "localisations": {"de": "Image", "en": "Image"}}, {"id": "13", "localisations": {"de": "InteractiveResource", "en": "InteractiveResource"}}, {"id": "14", "localisations": {"de": "Instrument", "en": "Instrument"}}, {"id": "15", "localisations": {"de": "Journal", "en": "Journal"}}, {"id": "16", "localisations": {"de": "JournalArticle", "en": "JournalArticle"}}, {"id": "17", "localisations": {"de": "Model", "en": "Model"}}, {"id": "18", "localisations": {"de": "OutputManagementPlan", "en": "OutputManagementPlan"}}, {"id": "19", "localisations": {"de": "PeerReview", "en": "PeerReview"}}, {"id": "20", "localisations": {"de": "PhysicalObject", "en": "PhysicalObject"}}, {"id": "21", "localisations": {"de": "Preprint", "en": "Preprint"}}, {"id": "22", "localisations": {"de": "Report", "en": "Report"}}, {"id": "23", "localisations": {"de": "Service", "en": "Service"}}, {"id": "24", "localisations": {"de": "Software", "en": "Software"}}, {"id": "25", "localisations": {"de": "Sound", "en": "Sound"}}, {"id": "26", "localisations": {"de": "Standard", "en": "Standard"}}, {"id": "27", "localisations": {"de": "StudyRegistration", "en": "StudyRegistration"}}, {"id": "28", "localisations": {"de": "Text", "en": "Text"}}, {"id": "29", "localisations": {"de": "Workflow", "en": "Workflow"}}, {"id": "30", "localisations": {"de": "Other", "en": "Other"}}]');
INSERT INTO codelist VALUES (3,3386,100,'Ressourcen-Typ','Die Liste der Ressourcentypen ist initial eine Kopie der Codeliste 3385: Objektklasse 2 - Dokumenttyp','[{"id": "1", "localisations": {"de": "Aufsatz/Artikel/Tagungsbeitrag", "en": "Article/Conference Contribution"}}, {"id": "2", "localisations": {"de": "Broschüre/Bericht", "en": "Brochure/Bulletin"}}, {"id": "3", "localisations": {"de": "Zeitschrift", "en": "Journal"}}, {"id": "4", "localisations": {"de": "Buch/Monographie/Reihe", "en": "Book/Monograph/Series"}}, {"id": "5", "localisations": {"de": "Tagungsband/Sammelwerk", "en": "Proceedings/Compilation"}}, {"id": "6", "localisations": {"de": "Fachgutachten", "en": "Expert Report"}}]');
