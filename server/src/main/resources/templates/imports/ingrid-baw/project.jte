@import de.ingrid.igeserver.profiles.ingrid_baw.importer.ProjectMapperBaw
@import gg.jte.support.ForSupport

@param ProjectMapperBaw model

{
@template.imports.ingrid.base(model = model, additionalKeywords = @`
    ,
    "bawKeywords":   [
    @for (var entry : ForSupport.of(model.getBawKeywords()))
        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
    @endfor
    ],
    "subsoilKeywords": [
    @for (var entry : ForSupport.of(model.getSubsoilKeywords()))
        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
    @endfor
    ]
`)
    "orderNumber": "${model.getOrderNumber()}",
    "literatureReferences": [
    @for(var uuid : ForSupport.of(model.getLiteratureReferences()))
        {
        "uuid": "${uuid.get()}",
        "isExternalRef": false
        }@if (!uuid.isLast()),@endif
    @endfor
    ]
}
