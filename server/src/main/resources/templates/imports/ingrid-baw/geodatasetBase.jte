@import de.ingrid.igeserver.profiles.ingrid_baw.importer.GeodatasetMapperBaw
@import gg.jte.Content
@import gg.jte.support.ForSupport
@param GeodatasetMapperBaw model
@param Content typeSpecificFields = null

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "orderTitle": "${model.getOrderTitle()}",
    "orderNumber": "${model.getOrderNumber()}",
    "literatureReferences": [
    @for(var uuid : ForSupport.of(model.getLiteratureReferences()))
        {
        "uuid": "${uuid.get()}",
        "isExternalRef": false
        }@if (!uuid.isLast()),@endif
    @endfor
    ]
    ${typeSpecificFields}
`)
