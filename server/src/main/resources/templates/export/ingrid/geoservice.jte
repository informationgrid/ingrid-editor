@import de.ingrid.igeserver.profiles.ingrid.importer.MetadataModel
@import gg.jte.support.ForSupport
@param MetadataModel model 

{
    "title": "${model.getTitle()}",
    "_uuid": "${model.getUuid()}",
    "_parent": @if(model.getParentUuid() == null) null @else "${model.getParentUuid()}"@endif,
    "_type": "${model.getType()}",
    "isInspireIdentified": ${model.isInspireIdentified()},
    "isAdVCompatible": ${model.isAdVCompatible()},
    "isOpenData": ${model.isOpenData()},
    "description": "${model.getDescription()}",
    "alternateTitle": "${model.getAlternateTitle()}",
    "pointOfContact": [
        @for(var contact : ForSupport.of(model.getPointOfContacts()))
        {
            "ref": {
                "_uuid": "${contact.get().getRefUuid()}",
                "_type": "${contact.get().getAddressType()}",
                @if(contact.get().isOrganization())
                "organization": "${contact.get().getOrganization()}",
                @elseif(contact.get().getPersonInfo() != null)
                "salutation": @template.ingrid.partial.key-value(item = contact.get().getPersonInfo().getSalutation()),
                "firstName": "${contact.get().getPersonInfo().getFirstName()}",
                "lastName": "${contact.get().getPersonInfo().getLastName()}",
                @endif
                @if(contact.get().getAddress() != null)
                !{var address = contact.get().getAddress();}
                "address": {
                    @if(address.getCity() != null)"city": "${address.getCity()}",@endif
                    @if(address.getPOBox() != null)"po-box": "${address.getPOBox()}",@endif
                    @if(address.getStreet() != null)"street": "${address.getStreet()}",@endif
                    "country": @template.ingrid.partial.key-value(item = address.getCountry()),
                    @if(address.getZipCode() != null)"zip-code": "${address.getZipCode()}",@endif
                    @if(address.getZipPOBox() != null)"zip-po-box": "${address.getZipPOBox()}",@endif
                    "administrativeArea": @template.ingrid.partial.key-value(item = address.getAdministrativeArea())
                },
                @endif
                "contact": [
                @for(var communication : ForSupport.of(contact.get().getCommunications()))
                {
                    "type": @template.ingrid.partial.key-value(item = communication.get().getType()),
                    "connection": "${communication.get().getConnection()}"
                }@if (!communication.isLast()),@endif
                @endfor
                ]
            },
            "type": @template.ingrid.partial.key-value(item = contact.get().getType())
        }@if (!contact.isLast()),@endif
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
    "keywords": [
        @for(var keyword : ForSupport.of(model.getKeywords()))
        "${keyword.get()}"@if (!keyword.isLast()),@endif
        @endfor
    ],
    "service": {
        "classification": @template.ingrid.partial.key-values(list = model.getServiceCategories()),
        "type": @template.ingrid.partial.key-value(item = model.getServiceType()),
        "version": @template.ingrid.partial.key-values(list = model.getServiceVersions()),
        "operations": [
            @for(var operation : ForSupport.of(model.getOperations()))
            {
                "name": "${operation.get().getName()}",
                "description": "${operation.get().getDescription()}",
                "methodCall": "${operation.get().getMethodCall()}"
            }@if (!operation.isLast()),@endif
            @endfor
        ],
        "resolution": [
            @for(var resolution : ForSupport.of(model.getResolutions()))
            {
                "denominator": ${resolution.get().getDenominator()},
                "distanceMeter": ${resolution.get().getDistanceMeter()},
                "distanceDPI": ${resolution.get().getDistanceDPI()}
            }@if (!resolution.isLast()),@endif
            @endfor
        ],
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
        "hasAccessConstraints": false
    },
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
        "useLimitation": "${model.getUseLimitation()}"
    },
    "distribution": {
        "format": [
        @for(var format : ForSupport.of(model.getDistributionFormat()))
            {
                "name": @template.ingrid.partial.key-value(item = format.get().getName()),
                "version": "${format.get().getVersion()}",
                "compression": "${format.get().getCompression()}",
                "specification": "${format.get().getSpecification()}"
            }@if (!format.isLast()),@endif
        @endfor
        ]
    },
    "digitalTransferOptions": [
    @for(var option : ForSupport.of(model.getDigitalTransferOptions()))
        {
            "name": @template.ingrid.partial.key-value(item = option.get().getName()),
            "transferSize": ${option.get().getTransferSize()},
            "mediumNote": "${option.get().getMediumNote()}"
        }@if (!option.isLast()),@endif
    @endfor
    ],
    "orderInfo": "${model.getOrderInfo()}",
    "references": [
    @for(var reference : ForSupport.of(model.getReferences()))
        {
            "type": @template.ingrid.partial.key-value(item = reference.get().getType()),
            "title": "${reference.get().getTitle()}",
            "url": "${reference.get().getUrl()}",
            "explanation": "${reference.get().getExplanation()}"
        }@if (!reference.isLast()),@endif
    @endfor
    ]
}
