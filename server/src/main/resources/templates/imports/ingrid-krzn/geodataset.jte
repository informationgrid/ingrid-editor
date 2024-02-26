@import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
@import gg.jte.support.ForSupport
@param GeodatasetMapper model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "dataSetURI": "${model.getDatasetURI()}"
`)