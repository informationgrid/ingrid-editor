@import de.ingrid.igeserver.profiles.ingrid.importer.MetadataModel
@import gg.jte.support.ForSupport
@param MetadataModel model 

{
    "title": "${model.getTitle()}",
    "_uuid": "${model.getUuid()}",
    "_parent": null,
    "_type": "InGridGeoService",
    "_created": "",
    "_createdBy": "",
    "_modified": "",
    "_modifiedBy": "",
    "isInspireIdentified": ${model.isInspireIdentified()},
    "isAdVCompatible": ${model.isAdVCompatible()},
    "isOpenData": ${model.isOpenData()},
    "description": "${model.getDescription()}",
    "pointOfContact": [
        @for(var contactUuid : ForSupport.of(model.getPointOfContacts()))
        {
            "ref": "${contactUuid.get().getRefUuid()}",
            "type": @template.ingrid.partial.key-value(item = contactUuid.get().getType())
        }@if (!contactUuid.isLast()),@endif
        @endfor
    ],
    "advProductGroups": @template.ingrid.partial.key-values(list = model.getAdvProductGroups()),
    "themes": @template.ingrid.partial.key-values(list = model.getThemes()),
    "priorityDatasets": @template.ingrid.partial.key-values(list = model.getPriorityDatasets()),
    "spatialScope": null,
    "keywords": [],
    "serviceCategories": @template.ingrid.partial.key-values(list = model.getServiceCategories()),
    "serviceType": @template.ingrid.partial.key-value(item = model.getServiceType()),
    "serviceVersion": @template.ingrid.partial.key-values(list = model.getServiceVersions()),
    "coupledResources": [],
    "couplingType": @template.ingrid.partial.key-value(item = model.getCouplingType()),
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
                "referenceDateType": @template.ingrid.partial.key-value(item = model.getReferenceDateType())
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
        "language": @template.ingrid.partial.key-value(item = model.getLanguage())
    },
    "extraInfoPublishArea": @template.ingrid.partial.key-value(item = model.getExtraInfoPublishArea()),
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