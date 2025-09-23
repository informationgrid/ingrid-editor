@import de.ingrid.igeserver.profiles.ingrid_baw.importer.GeoserviceMapperBaw
@import gg.jte.support.ForSupport
@param GeoserviceMapperBaw model
@template.imports.ingrid.geoservice(model = model, contentInfo = @`
    ,
    "literatureReferences": [
    @for(var uuid : ForSupport.of(model.getLiteratureReferences()))
        {
        "uuid": "${uuid.get()}",
        "isExternalRef": false
        }@if (!uuid.isLast()),@endif
    @endfor
    ]
`, additionalKeywords = @`
    ,
    "bawKeywords":   [
    @for (var entry : ForSupport.of(model.getBawKeywords()))
        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
    @endfor
    ],
    "subsoilKeywords": []
`)
