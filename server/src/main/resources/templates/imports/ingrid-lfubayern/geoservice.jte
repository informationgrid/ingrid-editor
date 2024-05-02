@import de.ingrid.igeserver.profiles.ingrid_lfubayern.importer.GeoserviceMapperLfUBayern
@param GeoserviceMapperLfUBayern model

@template.imports.ingrid.geoservice(model = model, additionalKeywords = @`
    ,
    "internalKeywords": @template.imports.ingrid.partial.key-values(list = model.getInternalKeywords())
`, additionalResource = @`
    , "useConstraintsComments": "${model.getUseConstraintComments()}"
`
, contentInfo = @`
    ,
    "fees": "${model.getFees()}",
    "dataSetURI": "${model.getGeolink()}"
`)