@import de.ingrid.igeserver.profiles.ingrid_lfubayern.importer.ApplicationMapperLfUBayern
@param ApplicationMapperLfUBayern model

@template.imports.ingrid.application(model = model, additionalResource = @`
    , "useConstraintsComments": "${model.getUseConstraintComments()}"
`
, contentInfo = @`
    ,
    "fees": "${model.getFees()}",
    "dataSetURI": "${model.getGeolink()}"
`)