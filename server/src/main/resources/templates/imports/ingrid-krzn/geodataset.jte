@import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
@import gg.jte.support.ForSupport
@param GeodatasetMapper model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "dataSetURIs": [
    @for(var datasetURI : ForSupport.of(model.getDatasetURIs()))
        {
            "key": null,
            "value": "${datasetURI.get()}"
        }@if (!datasetURI.isLast()),@endif
    @endfor
    ]
`)