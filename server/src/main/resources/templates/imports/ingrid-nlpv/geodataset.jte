@import de.ingrid.igeserver.profiles.ingrid_nlpv.importer.GeodatasetMapperNLPV
@param GeodatasetMapperNLPV model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "fees": "${model.getFees()}"
`)