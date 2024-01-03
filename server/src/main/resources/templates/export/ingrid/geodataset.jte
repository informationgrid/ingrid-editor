@import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
@import gg.jte.Content
@import gg.jte.support.ForSupport
@param GeodatasetMapper model
@param Content contentInfo = null

{
    @template.ingrid.base(model = model)
    "invekosKeywords": @template.ingrid.partial.key-values(list = model.getInVeKoSKeywords()),
    "subType": @template.ingrid.partial.key-value(item = model.getSubtype()),
    "metadata": {
        "language": @template.ingrid.partial.key-value(item = model.getLanguage()),
        "characterSet": @template.ingrid.partial.key-value(item = model.getCharacterSet())
    },
    "resolution": [
    @for(var resolution : ForSupport.of(model.getResolutions()))
        {
        "denominator": @template.ingrid.partial.value-or-null(item = resolution.get().getDenominator()),
        "distanceMeter": @template.ingrid.partial.value-or-null(item = resolution.get().getDistanceMeter()),
        "distanceDPI": @template.ingrid.partial.value-or-null(item = resolution.get().getDistanceDPI())
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
                    "description":  @template.ingrid.partial.key-values(list = model.getProcessStep())
                }
            }
       }
    },
    "dataQuality": {
        "completenessOmission": {
            @if(model.getCompletenessOmissionValue() != null)"measResult": ${model.getCompletenessOmissionValue()}@endif
        }
    },
    !{var positionalAccuracy = model.getPositionalAccuracy();}
    "absoluteExternalPositionalAccuracy": {
        "vertical": @template.ingrid.partial.value-or-null(item = positionalAccuracy.getVertical()),
        "horizontal": @template.ingrid.partial.value-or-null(item = positionalAccuracy.getHorizontal()),
        "griddedDataPositionalAccuracy": @template.ingrid.partial.value-or-null(item = positionalAccuracy.getGriddedDataPositionalAccuracy())
    },
    "qualities": [
    @for(var quality : ForSupport.of(model.getQualities()))
        {
        "_type": "${quality.get().getType()}",
        "measureType": @template.ingrid.partial.key-value(item = quality.get().getMeasureType()),
        "value": @template.ingrid.partial.value-or-null(item = quality.get().getValue()),
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
    "isInspireConform": false,
    "vectorSpatialRepresentation": [
    @for(var vector : ForSupport.of(model.getVectorSpatialRepresentation()))
        {
        "topologyLevel": @template.ingrid.partial.key-value(item = vector.get().getTopologyLevel()),
        "geometricObjectType": @template.ingrid.partial.key-value(item = vector.get().getObjectType()),
        "geometricObjectCount": @template.ingrid.partial.value-or-null(item = vector.get().getObjectCount())
        }@if (!vector.isLast()),@endif
    @endfor
    ]
    !{var gridSpatial = model.getGridSpatialRepresentation();}
    @if (gridSpatial != null)
    , "gridSpatialRepresentation": {
        "type": @template.ingrid.partial.key-value(item = gridSpatial.getType()),
        "axesDimensionProperties": [
        @for(var property : ForSupport.of(gridSpatial.getAxesDimensionProperties()))
            {
            "name": @template.ingrid.partial.key-value(item = property.get().getName()),
            "size": @template.ingrid.partial.value-or-null(item = property.get().getSize()),
            "resolution": @template.ingrid.partial.value-or-null(item = property.get().getResolution())
            }@if (!property.isLast()),@endif
        @endfor
        ],
        "transformationParameterAvailability": ${gridSpatial.getTransformationParameterAvailability()},
        "numberOfDimensions": ${gridSpatial.getNumberOfDimensions()},
        "cellGeometry": @template.ingrid.partial.key-value(item = gridSpatial.getCellGeometry())
        @if (gridSpatial.getType() != null && gridSpatial.getType().getKey().equals("rectified"))
        , "georectified": {
            "checkPointAvailability": ${gridSpatial.getCheckPointAvailability()},
            "checkPointDescription": "${gridSpatial.getCheckPointDescription()}",
            "cornerPoints": "${gridSpatial.getCornerPoints()}",
            "pointInPixel": @template.ingrid.partial.key-value(item = gridSpatial.getPointInPixel())
        }
        @endif
        @if (gridSpatial.getType() != null && gridSpatial.getType().getKey().equals("referenced"))
        , "georeferenceable": {
            "orientationParameterAvailability": ${gridSpatial.getOrientationParameterAvailability()},
            "controlPointAvaliability": ${gridSpatial.getControlPointAvailability()},
            "parameters": "${gridSpatial.getGeoRefParameters()}"
        }
        @endif
    }
    @endif ${contentInfo}
}
