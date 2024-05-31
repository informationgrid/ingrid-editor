@import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeodatasetMapper
@import gg.jte.support.ForSupport
@param GeodatasetMapper model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "geometryContext": [
    @for(var geometryContext : ForSupport.of(model.getGeometryContexts()))
    {
        "name": "${geometryContext.get().getName()}",
        "dataType": "${geometryContext.get().getDataType()}",
        "description": "${geometryContext.get().getDescription()}",
        "featureType": @template.imports.ingrid.partial.key-value(item = geometryContext.get().getFeatureType()),
        "geometryType": "${geometryContext.get().getGeometryType()}",
        @if(geometryContext.get().getMin() != null) "min": ${geometryContext.get().getMin()},@endif
        @if(geometryContext.get().getMax() != null) "max": ${geometryContext.get().getMax()},@endif
        "unit": "${geometryContext.get().getUnit()}",
        "attributes": [
        @for(var item : ForSupport.of(geometryContext.get().getAttributes()))
            {
                "key": "${item.get().getKey()}",
                "value": "${item.get().getValue()}"
            }@if (!item.isLast()),@endif
        @endfor
        ]
    }@if (!geometryContext.isLast()),@endif
    @endfor
    ]
`)