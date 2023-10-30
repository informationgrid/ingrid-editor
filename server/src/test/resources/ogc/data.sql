TRUNCATE TABLE document RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_wrapper RESTART IDENTITY CASCADE;
TRUNCATE TABLE document_archive RESTART IDENTITY CASCADE;
TRUNCATE TABLE audit_log RESTART IDENTITY CASCADE;
TRUNCATE TABLE user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog_user_info RESTART IDENTITY CASCADE;
TRUNCATE TABLE behaviour RESTART IDENTITY CASCADE;
TRUNCATE TABLE catalog RESTART IDENTITY CASCADE;

-- catalogs
INSERT INTO catalog VALUES (100, 'test_catalog_ogc', 'ingrid', 'Test Catalog', 'Test Catalog Description', now(), now(), NULL);

-- users
INSERT INTO user_info VALUES (10, 'user1', 100, '{"recentLogins": [1604100256021]}', 2);
INSERT INTO catalog_user_info VALUES (100, 10);

-- documents and wrappers
INSERT INTO document VALUES (1000, 100, 'b08533dc-f3cd-46ea-a12e-d7f799d59330', 'InGridGeoDataset', 'Test Geodatensatz', '{"dataset": {"languages": ["150"]}, "lineage": {"statement": "Grundlage test"}, "spatial": {"references": [{"type": "free", "value": {"lat1": 49.923497541799584, "lat2": 50.986648528592625, "lon1": 7.874486734396174, "lon2": 9.939849552642}}], "spatialSystems": [{"key": "84"}], "verticalExtent": {"unitOfMeasure": null}}, "subType": {"key": "5"}, "keywords": {"free": [], "gemet": [], "umthes": []}, "metadata": {"language": {"key": "150"}, "characterSet": null}, "resource": {"useConstraints": [{"title": {"key": "2"}}], "accessConstraints": []}, "temporal": {"events": [{"referenceDate": "2023-10-15T22:00:00.000Z", "referenceDateType": {"key": "1"}}], "status": null, "resourceDateType": null}, "extraInfo": {"legalBasicsDescriptions": []}, "qualities": [], "identifier": "44f911ee-afcb-44c1-b6db-2783e93863f2", "isOpenData": false, "references": [], "resolution": [], "dataQuality": {"completenessOmission": {}}, "description": "Zum Testen von Post Methoden in einen Ordner", "distribution": {"format": []}, "pointOfContact": [{"ref": "DA64401A-2AFC-458D-A8AF-58D0A3C35AA9", "type": {"key": "12"}}, {"ref": "110C6012-1713-44C0-9A33-4E2C24D06966", "type": {"key": "1"}}], "dataQualityInfo": {"lineage": {"source": {"processStep": {"description": []}, "descriptions": []}}}, "isAdVCompatible": false, "topicCategories": [{"key": "4"}], "advProductGroups": [], "graphicOverviews": [], "isInspireIdentified": false, "digitalTransferOptions": [], "maintenanceInformation": {"maintenanceAndUpdateFrequency": null, "userDefinedMaintenanceFrequency": {"unit": null}}, "portrayalCatalogueInfo": {"citation": []}, "spatialRepresentationType": [], "featureCatalogueDescription": {"citation": [], "featureTypes": []}, "absoluteExternalPositionalAccuracy": {}}',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'PUBLISHED'
);
INSERT INTO document VALUES (1001, 100, 'DA64401A-2AFC-458D-A8AF-58D0A3C35AA9', 'InGridOrganisationDoc', 'Wemove Test', '{"address": {"city": "Frankfurt", "po-box": "123", "street": "Hanauer Landstr. 52", "country": {"key": "276"}, "zip-code": "60314", "zip-po-box": "P123", "administrativeArea": {"key": "7"}}, "contact": [{"type": {"key": "3"}, "connection": "test@wemove.com"}], "organization": "Wemove Test", "positionName": "Notizen MMMM", "hoursOfService": ""}',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'PUBLISHED'
);
INSERT INTO document VALUES (1002, 100, '110C6012-1713-44C0-9A33-4E2C24D06966', 'InGridOrganisationDoc', 'Test Document', '{"address": {"country": null, "administrativeArea": {"key": "0"}}, "contact": [{"type": {"key": "3"}, "connection": "you@wemove.com"}], "organization": "Contact Short", "positionName": "", "hoursOfService": ""}',
    0, '2020-10-09 22:48:28.644575+00', '2020-10-09 22:48:28.644575+00', null, null, null, null, true, 'PUBLISHED'
);


INSERT INTO document_wrapper VALUES (1000, 100, NULL, 'b08533dc-f3cd-46ea-a12e-d7f799d59330', 'InGridGeoDataset', 'data', 0);

INSERT INTO document_wrapper VALUES (1001, 100, NULL, 'DA64401A-2AFC-458D-A8AF-58D0A3C35AA9', 'InGridOrganisationDoc', 'address', 0);

INSERT INTO document_wrapper VALUES (1002, 100, NULL, '110C6012-1713-44C0-9A33-4E2C24D06966', 'InGridOrganisationDoc', 'address', 0);


