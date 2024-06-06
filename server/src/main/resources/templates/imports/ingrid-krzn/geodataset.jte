@import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeodatasetMapper
@import gg.jte.support.ForSupport
@param GeodatasetMapper model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "dataSetURI": "${model.getDatasetURI()}"
`)