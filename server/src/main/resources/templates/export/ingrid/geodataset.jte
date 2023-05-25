@import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
@import gg.jte.support.ForSupport
@param GeodatasetMapper model

{
    @template.ingrid.base(model = model)
    "subType": @template.ingrid.partial.key-value(item = model.getSubtype()),
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
<%--    "isInspireConform": ${model.isInspireConform()},--%>
    "vectorSpatialRepresentation": [
    @for(var vector : ForSupport.of(model.getVectorSpatialRepresentation()))
        {
        "topologyLevel": @template.ingrid.partial.key-value(item = vector.get().getTopologyLevel()),
        "geometricObjectType": @template.ingrid.partial.key-value(item = vector.get().getObjectType()),
        "geometricObjectCount": ${vector.get().getObjectCount()}
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
            "size": ${property.get().getSize()},
            "resolution": ${property.get().getResolution()}
            }@if (!property.isLast()),@endif
        @endfor
        ],
        "transformationParameterAvailability": ${gridSpatial.getTransformationParameterAvailability()},
        "numberOfDimensions": ${gridSpatial.getNumberOfDimensions()},
        "cellGeometry": @template.ingrid.partial.key-value(item = gridSpatial.getCellGeometry())
        @if (gridSpatial.getType().getKey().equals("rectified"))
        , "georectified": {
            "checkPointAvailability": ${gridSpatial.getCheckPointAvailability()},
            "checkPointDescription": "${gridSpatial.getCheckPointDescription()}",
            "cornerPoints": "${gridSpatial.getCornerPoints()}",
            "pointInPixel": @template.ingrid.partial.key-value(item = gridSpatial.getPointInPixel())
        }
        @endif
        @if (gridSpatial.getType().getKey().equals("referenced"))
        , "georeferenceable": {
            "orientationParameterAvailability": ${gridSpatial.getOrientationParameterAvailability()},
            "controlPointAvaliability": ${gridSpatial.getControlPointAvailability()},
            "parameters": "${gridSpatial.getGeoRefParameters()}"
        }
        @endif
    }
    @endif
}
