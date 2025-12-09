@import de.ingrid.igeserver.profiles.ingrid_nlpv.importer.GeoserviceMapperNLPV
@param GeoserviceMapperNLPV model

@template.imports.ingrid.geoservice(model = model, contentInfo = @`
    ,
    "fees": "${model.getFees()}"
`)