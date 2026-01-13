@import de.ingrid.igeserver.profiles.ingrid_baw.importer.GeodatasetMapperBaw
@import gg.jte.Content
@import gg.jte.support.ForSupport
@param GeodatasetMapperBaw model
@param Content typeSpecificFields = null

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "bawOrderInfo":  @template.imports.ingrid.partial.key-value(item = model.getBawOrderInfo()),
    "literatureReferences": [
    @for(var uuid : ForSupport.of(model.getLiteratureReferences()))
        {
        "uuid": "${uuid.get()}",
        "isExternalRef": false
        }@if (!uuid.isLast()),@endif
    @endfor
    ]
    ${typeSpecificFields}
`, additionalKeywords = @`
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
