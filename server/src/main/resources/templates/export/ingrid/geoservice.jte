@import de.ingrid.igeserver.profiles.ingrid.importer.MetadataModel
@param MetadataModel model 

{
    "title": "${model.getTitle()}",
    "_uuid": "${model.getUuid()}",
    "_parent": null,
    "_type": "InGridGeoService",
    "_created": "2023-02-05T05:34:39.709916+01:00",
    "_createdBy": "ingrid catalog",
    "_modified": "2023-02-05T05:35:13.250027+01:00",
    "_modifiedBy": "ingrid catalog",
    "isInspireIdentified": false,
    "isAdVCompatible": false,
    "isOpenData": false,
    "description": "some description",
    "pointOfContact": [
        {
            "ref": {
                "title": "addr_3",
                "hasWritePermission": true,
                "hasOnlySubtreeWritePermission": false,
                "_uuid": "83f92167-6606-4182-948c-5747ad608b80",
                "_type": "InGridOrganisationDoc",
                "_version": 1,
                "_created": "2023-01-12T11:31:12.90563+01:00",
                "_modified": "2023-01-12T11:31:23.582622+01:00",
                "_createdBy": "Andre Wallat",
                "_modifiedBy": "Andre Wallat",
                "_state": "P",
                "_id": "12343",
                "address": {
                    "administrativeArea": {
                        "key": "4"
                    }
                },
                "contact": [
                    {
                        "type": {
                            "key": "1"
                        },
                        "connection": "098756634"
                    }
                ],
                "organization": "addr_3",
                "_parent": null
            },
            "type": {
                "key": "7"
            }
        }
    ],
    "advProductGroups": [],
    "themes": [],
    "priorityDatasets": [],
    "spatialScope": null,
    "keywords": [],
    "serviceCategories": [
        {
            "key": "801"
        }
    ],
    "serviceType": {
        "key": "1"
    },
    "serviceVersion": [],
    "coupledResources": [],
    "couplingType": {
        "key": "loose"
    },
    "hasAccessConstraints": false,
    "spatial": {
        "references": [
            {
                "type": "free",
                "title": "Weltwitz, Schmieritz, Triptis, Saale-Orla-Kreis, Thüringen, 07806, Deutschland (village)",
                "value": {
                    "lat1": 50.7079439,
                    "lat2": 50.7479439,
                    "lon1": 11.7667636,
                    "lon2": 11.8067636
                }
            }
        ],
        "spatialSystems": [
            {
                "key": "9000002"
            }
        ],
        "verticalExtent": {
            "unitOfMeasure": null
        }
    },
    "temporal": {
        "events": [
            {
                "referenceDate": "2020-12-17T23:00:00.000Z",
                "referenceDateType": {
                    "key": "1"
                }
            }
        ],
        "resourceDateType": null,
        "status": null
    },
    "maintenanceInformation": {
        "maintenanceAndUpdateFrequency": null,
        "userDefinedMaintenanceFrequency": {
            "unit": null
        }
    },
    "metadata": {
        "language": {
            "key": "150"
        }
    },
    "extraInfoPublishArea": {
        "key": "2"
    },
    "extraInfo": {
        "legalBasicsDescriptions": []
    },
    "resource": {
        "accessConstraints": []
    },
    "distribution": {
        "format": []
    },
    "digitalTransferOptions": [],
    "references": []
}