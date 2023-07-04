@import de.ingrid.igeserver.profiles.ingrid.importer.GeoserviceMapper
@import gg.jte.support.ForSupport
@param GeoserviceMapper model 

{
    @template.ingrid.base(model = model)
    "metadata": {
        "language": @template.ingrid.partial.key-value(item = model.getLanguage())
    },
    "service": {
        "classification": @template.ingrid.partial.key-values(list = model.getServiceCategories()),
        "type": @template.ingrid.partial.key-value(item = model.getServiceType()),
        "version": @template.ingrid.partial.key-values(list = model.getServiceVersions()),
        "operations": [
        @for(var operation : ForSupport.of(model.getOperations()))
            {
            "name": @template.ingrid.partial.key-value(item = operation.get().getName()),
            "description": "${operation.get().getDescription()}",
            "methodCall": "${operation.get().getMethodCall()}"
            }@if (!operation.isLast()),@endif
        @endfor
        ],
        "resolution": [
        @for(var resolution : ForSupport.of(model.getResolutions()))
            {
            "denominator": @template.ingrid.partial.value-or-null(item = resolution.get().getDenominator()),
            "distanceMeter": @template.ingrid.partial.value-or-null(item = resolution.get().getDistanceMeter()),
            "distanceDPI": @template.ingrid.partial.value-or-null(item = resolution.get().getDistanceDPI())
            }@if (!resolution.isLast()),@endif
        @endfor
        ],
        "systemEnvironment": "${model.getSystemEnvironment()}",
        "implementationHistory": "${model.getImplementationHistory()}",
        "explanation": "${model.getServiceExplanation()}",
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
    }
}
