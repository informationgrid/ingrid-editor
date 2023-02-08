@import de.ingrid.igeserver.profiles.ingrid.importer.MetadataModel
@import gg.jte.support.ForSupport
@param MetadataModel model 

{
    "title": "${model.getTitle()}",
    "_uuid": "${model.getUuid()}",
    "_parent": @if(model.getParentUuid() == null) null @else "${model.getParentUuid()}"@endif,
    "_type": "${model.getType()}",
    "_createdBy": "",
    "_modifiedBy": "",
    "isInspireIdentified": ${model.isInspireIdentified()},
    "isAdVCompatible": ${model.isAdVCompatible()},
    "isOpenData": ${model.isOpenData()},
    "description": "${model.getDescription()}",
    "alternateTitle": "${model.getAlternateTitle()}",
    "pointOfContact": [
        @for(var contactUuid : ForSupport.of(model.getPointOfContacts()))
        {
            "ref": "${contactUuid.get().getRefUuid()}",
            "type": @template.ingrid.partial.key-value(item = contactUuid.get().getType())
        }@if (!contactUuid.isLast()),@endif
        @endfor
    ],
    "graphicOverviews": [
    @for(var image : ForSupport.of(model.getGraphicOverviews()))
        {
            "fileName": {
                "asLink": true,
                "value": "${image.get().getFileName()}",
                "uri": "${image.get().getFileName()}"
            },
            "fileDescription": "${image.get().getDescription()}"
        }@if (!image.isLast()),@endif
    @endfor
    ],
    "advProductGroups": @template.ingrid.partial.key-values(list = model.getAdvProductGroups()),
    "themes": @template.ingrid.partial.key-values(list = model.getThemes()),
    "priorityDatasets": @template.ingrid.partial.key-values(list = model.getPriorityDatasets()),
    "openDataCategories": @template.ingrid.partial.key-values(list = model.getOpenDataCategories()),
    "spatialScope": @template.ingrid.partial.key-value(item = model.getSpatialScope()),
    "keywords": [],
    "serviceCategories": @template.ingrid.partial.key-values(list = model.getServiceCategories()),
    "serviceType": @template.ingrid.partial.key-value(item = model.getServiceType()),
    "serviceVersion": @template.ingrid.partial.key-values(list = model.getServiceVersions()),
    "coupledResources": [
    @for(var resource : ForSupport.of(model.getCoupledResources()))
        {
            "uuid": "${resource.get().getUuid()}",
            "state": "${resource.get().getState()}",
            "title": "${resource.get().getTitle()}",
            "isExternalRef": ${resource.get().isExternalRef()}
        }@if (!resource.isLast()),@endif
    @endfor
    ],
    "couplingType": @template.ingrid.partial.key-value(item = model.getCouplingType()),
    "hasAccessConstraints": false,
    "spatial": {
        "references": [
        @for(var ref : ForSupport.of(model.getSpatialReferences()))
            {
                "type": "${ref.get().getType()}",
                "title": "${ref.get().getTitle()}",
                "value": {
                    "lat1": ${ref.get().getCoordinates().getLat1()},
                    "lon1": ${ref.get().getCoordinates().getLon1()},
                    "lat2": ${ref.get().getCoordinates().getLat2()},
                    "lon2": ${ref.get().getCoordinates().getLon2()}
                }
            }@if (!ref.isLast()),@endif
        @endfor
        ],
        "regionKey": "${model.getRegionKey()}",
        "spatialSystems": @template.ingrid.partial.key-values(list = model.getSpatialSystems()),
        @if(model.getVerticalExtent() != null)
        "verticalExtent": {
            "minimumValue": ${model.getVerticalExtent().getMin()},
            "maximumValue": ${model.getVerticalExtent().getMax()},
            "unitOfMeasure": {
                "key": "${model.getVerticalExtent().getUom()}"
            },
            "Datum": {
                "key": "${model.getVerticalExtent().getDatum()}"
            }
        },
        @endif
        "description": "${model.getSpatialDescription()}"
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
