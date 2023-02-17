@import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
@import gg.jte.support.ForSupport
@param GeodatasetMapper model 

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
    "topicCategories": @template.ingrid.partial.key-values(list = model.getTopicCategories()),
    "keywords": [
        @for(var keyword : ForSupport.of(model.getKeywords()))
        "${keyword.get()}"@if (!keyword.isLast()),@endif
        @endfor
    ],
    "lineage": {
        "statement": "${model.getLineageStatement()}"
    },
    "identifier": "${model.getMDIdentifier()}",
    "spatialRepresentationType":  @template.ingrid.partial.key-values(list = model.getSpatialRepresentationTypes()),
    "resolution": [
        @for(var resolution : ForSupport.of(model.getResolutions()))
        {
            "denominator": ${resolution.get().getDenominator()},
            "distanceMeter": ${resolution.get().getDistanceMeter()},
            "distanceDPI": ${resolution.get().getDistanceDPI()}
        }@if (!resolution.isLast()),@endif
        @endfor
    ],
    "portrayalCatalogueInfo": {
        "citation": [
            {
                "title": {
                    "key": "-1"
                },
                "date": "",
                "edition": ""
            }
        ]
    },
    "featureCatalogueDescription": {
        "citation": [
            {
                "title": {
                    "key": ""
                },
                "date": "",
                "edition": ""
            }
        ],
        "featureTypes": @template.ingrid.partial.key-values(list = model.getFeatureTypes())
    },
    "dataQualityInfo": {
        "lineage": {
            "source": {
                "descriptions": @template.ingrid.partial.key-values(list = model.getSourceDescriptions()),
                "processStep": {
                    "description": "${model.getProcessStep()}"
                }
            }
        }
    },
    "dataQuality": {
        "completenessOmission": {
            "measResult": ${model.getCompletenessOmissionValue()}
        }
    },
    "absoluteExternalPositionalAccuracy": {
        "vertical": -1,
        "horizontal": -1,
        "griddedDataPositionalAccuracy": -1
    },
    "qualities": [
        @for(var quality : ForSupport.of(model.getQualities()))
        {
            "_type": "completenessComission",
            "measureType": {
                "key": "-1"
            },
            "value": -1,
            "parameter": "-1"
        }@if (!quality.isLast()),@endif
        @endfor
    ],
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
        @if(time.getUntilDate() == null)
        "resourceDate": "${time.getDate()}",
        @else
        "resourceRange": {
            "start": "${time.getDate()}",
            "end": "${time.getUntilDate()}"
        },
        @endif
        "resourceDateTypeSince": @template.ingrid.partial.key-value(item = time.getDateTypeSince())
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
        "language": @template.ingrid.partial.key-value(item = model.getLanguage()),
        "characterSet": @template.ingrid.partial.key-value(item = model.getCharacterSet())
    },
    "extraInfoPublishArea": @template.ingrid.partial.key-value(item = model.getExtraInfoPublishArea()),
    "conformanceResult": [
        @for(var item : ForSupport.of(model.getConformanceResult()))
        {
            "pass": @template.ingrid.partial.key-value(item = item.get().getPass()),
            "isInspire": ${item.get().isInspire()},
            "explanation": "${item.get().getExplanation()}",
            "specification": @template.ingrid.partial.key-value(item = item.get().getSpecification()),
            "publicationDate": "${item.get().getPublicationDate()}"
        }@if (!item.isLast()),@endif
        @endfor
    ],
    "dataset": {
        "languages": [
        @for(var item : ForSupport.of(model.getLanguages()))
            "${item.get()}"@if (!item.isLast()),@endif
        @endfor
        ]
    },
    "extraInfo": {
        "legalBasicsDescriptions": @template.ingrid.partial.key-values(list = model.getLegalDescriptions())
    },
    "resource": {
        "purpose": "${model.getPurpose()}",
        "specificUsage": "${model.getSpecificUsage()}",
        "accessConstraints": @template.ingrid.partial.key-values(list = model.getAccessConstraints()),
        "useConstraints": [
            @for(var item : ForSupport.of(model.getUseConstraints()))
            {
                "title": @template.ingrid.partial.key-value(item = item.get().getTitle()),
                "source": "${item.get().getSource()}"
            }@if (!item.isLast()),@endif
            @endfor
        ],
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
    ],
    "isInspireConform": true,
    "vectorSpatialRepresentation": [
        {
            "topologyLevel": {
                "key": "4"
            },
            "geometricObjectType": {
                "key": "5"
            },
            "geometricObjectCount": 8
        }
    ],
    "gridSpatialRepresentation": {
        "type": {
            "key": "rectified"
        },
        "axisDimensionsProperties": [],
        "transformationParameterAvailability": true,
        "numberOfDimenstions": 3,
        "cellGeometry": {
            "key": "2"
        },
        "georectified": {
            "checkPointAvailability": true,
            "checkPointDescription": "KT Beschreibung",
            "cornerPoints": "4",
            "pointInPixel": {
                "key": "2"
            }
        }
    }
}
