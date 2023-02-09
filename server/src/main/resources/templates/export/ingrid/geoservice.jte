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
            @if(resource.get().getUuid() != null)
            "uuid": "${resource.get().getUuid()}",
            @else
            "url": "${resource.get().getUrl()}",
            "title": "${resource.get().getTitle()}",
            @endif
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
        @for(var event : ForSupport.of(model.getTemporalEvents()))
            {
                "referenceDate": "${event.get().getDate()}",
                "referenceDateType": @template.ingrid.partial.key-value(item = event.get().getType())
            }@if (!event.isLast()),@endif
        @endfor
        ],
        !{var time = model.getTimeRelatedInfo();}
        "resourceDateType": @template.ingrid.partial.key-value(item = time.getType()),
        "status": @template.ingrid.partial.key-value(item = time.getStatus()),
        "resourceDate": "${time.getDate()}"
    },
    "maintenanceInformation": {
        !{var interval = model.getMaintenanceInterval();}
        "maintenanceAndUpdateFrequency": @template.ingrid.partial.key-value(item = interval.getInterval()),
        "userDefinedMaintenanceFrequency": {
            "number": ${interval.getValue()},
            "unit": @template.ingrid.partial.key-value(item = interval.getUnit())
        },
        "description": "${interval.getDescription()}"
    },
    "metadata": {
        "language": @template.ingrid.partial.key-value(item = model.getLanguage())
    },
    "extraInfoPublishArea": @template.ingrid.partial.key-value(item = model.getExtraInfoPublishArea()),
    "extraInfo": {
        "legalBasicsDescriptions": @template.ingrid.partial.key-values(list = model.getLegalDescriptions())
    },
    "resource": {
        "purpose": "${model.getPurpose()}",
        "specificUsage": "${model.getSpecificUsage()}",
        "accessConstraints": @template.ingrid.partial.key-values(list = model.getAccessConstraints()),
        "useLimitation": ""
    },
    "distribution": {
        "format": []
    },
    "digitalTransferOptions": [],
    "orderInfo": "",
    "references": []
}
