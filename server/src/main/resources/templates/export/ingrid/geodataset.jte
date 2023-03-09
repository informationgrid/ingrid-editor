@import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
@import gg.jte.support.ForSupport
@param GeodatasetMapper model 

{
    @template.ingrid.base(model = model)
    "metadata": {
        "language": @template.ingrid.partial.key-value(item = model.getLanguage()),
        "characterSet": @template.ingrid.partial.key-value(item = model.getCharacterSet())
    },
    "resolution": [
    @for(var resolution : ForSupport.of(model.getResolutions()))
        {
        "denominator": ${resolution.get().getDenominator()},
        "distanceMeter": ${resolution.get().getDistanceMeter()},
        "distanceDPI": ${resolution.get().getDistanceDPI()}
        }@if (!resolution.isLast()),@endif
    @endfor
    ],
    "topicCategories": @template.ingrid.partial.key-values(list = model.getTopicCategories()),
    "spatialRepresentationType":  @template.ingrid.partial.key-values(list = model.getSpatialRepresentationTypes()),
    "lineage": {
        "statement": "${model.getLineageStatement()}"
    },
    "identifier": "${model.getMDIdentifier()}",
    "portrayalCatalogueInfo": {
        "citation": [
        @for(var info : ForSupport.of(model.getPortrayalCatalogueInfo()))
            {
            "title": @template.ingrid.partial.key-value(item = info.get().getTitle()),
            "date": "${info.get().getDate()}",
            "edition": "${info.get().getEdition()}"
            }@if (!info.isLast()),@endif
        @endfor
        ]
    },
    "featureCatalogueDescription": {
        "citation": [
        @for(var info : ForSupport.of(model.getFeatureCatalogueDescription()))
            {
            "title": @template.ingrid.partial.key-value(item = info.get().getTitle()),
            "date": "${info.get().getDate()}",
            "edition": "${info.get().getEdition()}"
            }@if (!info.isLast()),@endif
        @endfor
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
    !{var positionalAccuracy = model.getPositionalAccuracy();}
    "absoluteExternalPositionalAccuracy": {
        "vertical": @if(positionalAccuracy.getVertical() != null)${positionalAccuracy.getVertical()}@else null@endif,
        "horizontal": @if(positionalAccuracy.getHorizontal() != null)${positionalAccuracy.getHorizontal()}@else null@endif,
        "griddedDataPositionalAccuracy": @if(positionalAccuracy.getGriddedDataPositionalAccuracy() != null)${positionalAccuracy.getGriddedDataPositionalAccuracy()}@else null@endif
    },
    "qualities": [
    @for(var quality : ForSupport.of(model.getQualities()))
        {
        "_type": "${quality.get().getType()}",
        "measureType": @template.ingrid.partial.key-value(item = quality.get().getMeasureType()),
        "value": ${quality.get().getValue()},
        "parameter": "${quality.get().getParameter()}"
        }@if (!quality.isLast()),@endif
    @endfor
    ],
    "dataset": {
        "languages": [
        @for(var item : ForSupport.of(model.getLanguages()))
            "${item.get()}"@if (!item.isLast()),@endif
        @endfor
        ]
    },
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
