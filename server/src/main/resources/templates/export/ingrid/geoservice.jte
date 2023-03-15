@import de.ingrid.igeserver.profiles.ingrid.importer.GeoserviceMapper
@import de.ingrid.igeserver.profiles.ingrid.importer.GeneralMapper
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
