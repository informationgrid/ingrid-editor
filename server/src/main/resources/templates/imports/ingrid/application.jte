@import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.ApplicationMapper
@import gg.jte.Content
@import gg.jte.support.ForSupport
@param ApplicationMapper model
@param Content contentInfo = null
@param Content additionalKeywords = null
@param Content additionalResource = null

{
    @template.imports.ingrid.base(model = model, additionalKeywords, additionalResource)
    "metadata": {
        "language": @template.imports.ingrid.partial.key-value(item = model.getLanguage()),
        "characterSet": @template.imports.ingrid.partial.key-value(item = model.getCharacterSet())
    },
    "dataset": {
        "languages": [
        @for(var item : ForSupport.of(model.getLanguages()))
            "${item.get()}"@if (!item.isLast()),@endif
        @endfor
        ]
    },
    "serviceType": @template.imports.ingrid.partial.key-value(item = model.getServiceType()),
    "serviceVersion": @template.imports.ingrid.partial.key-values(list = model.getServiceVersion()),
    "systemEnvironment": "${model.getSystemEnvironment()}",
    "implementationHistory": "${model.getImplementationHistory()}",
    "baseDataText": "${model.getBaseDataText()}",
    "explanation": "${model.getExplanation()}",
    "serviceUrls": [
    @for(var item : ForSupport.of(model.getServiceUrls()))
        {
            "name": "${item.get().getName()}",
            "url": "${item.get().getUrl()}",
            "description": "${item.get().getDescription()}"
        }@if (!item.isLast()),@endif
    @endfor
    ]
    ${contentInfo}
}
