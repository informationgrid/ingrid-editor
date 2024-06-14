@import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeoserviceMapper
@import gg.jte.Content
@import gg.jte.support.ForSupport
@param GeoserviceMapper model 
@param Content contentInfo = null
@param Content additionalKeywords = null
@param Content additionalResource = null
{
    @template.imports.ingrid.base(model = model, additionalKeywords, additionalResource)
    "metadata": {
        "language": @template.imports.ingrid.partial.key-value(item = model.getLanguage())
    },
    "service": {
        "classification": @template.imports.ingrid.partial.key-values(list = model.getServiceCategories()),
        "type": @template.imports.ingrid.partial.key-value(item = model.getServiceType()),
        "version": @template.imports.ingrid.partial.key-values(list = model.getServiceVersions()),
        "operations": [
        @for(var operation : ForSupport.of(model.getOperations()))
            {
            "name": @template.imports.ingrid.partial.key-value(item = operation.get().getName()),
            "description": "${operation.get().getDescription()}",
            "methodCall": "${operation.get().getMethodCall()}"
            }@if (!operation.isLast()),@endif
        @endfor
        ],
        "resolution": [
        @for(var resolution : ForSupport.of(model.getResolutions()))
            {
            "denominator": @template.imports.ingrid.partial.value-or-null(item = resolution.get().getDenominator()),
            "distanceMeter": @template.imports.ingrid.partial.value-or-null(item = resolution.get().getDistanceMeter()),
            "distanceDPI": @template.imports.ingrid.partial.value-or-null(item = resolution.get().getDistanceDPI())
            }@if (!resolution.isLast()),@endif
        @endfor
        ],
        "systemEnvironment": "${model.getSystemEnvironment()}",
        "implementationHistory": "${model.getImplementationHistory()}",
        "explanation": "${model.getServiceExplanation()}",
        "coupledResources": [
        @for(var resource : ForSupport.of(model.getCoupledResources()))
            {
            @if(resource.get().isExternalRef())
                "identifier": "",
                "uuid": "${resource.get().getUuid()}",
                "url": "${resource.get().getUrl()}",
                "title": "${resource.get().getTitle()}",
            @else
                "uuid": "${resource.get().getUuid()}",
            @endif
            "isExternalRef": ${resource.get().isExternalRef()}
            @if(!resource.get().getLayerNames().isEmpty())
                , "layerNames": [
                @for(var layer : ForSupport.of(resource.get().getLayerNames()))
                    "${layer.get()}"@if (!layer.isLast()),@endif
                @endfor
                ]
            @endif
            }@if (!resource.isLast()),@endif
        @endfor
        ],
        "couplingType": @template.imports.ingrid.partial.key-value(item = model.getCouplingType()),
        "hasAccessConstraints": false
    }
    ${contentInfo}
}
