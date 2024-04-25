@import de.ingrid.igeserver.profiles.ingrid_lubw.importer.GeodatasetMapperLUBW
@param GeodatasetMapperLUBW model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "oac": "${model.getOAC()}"
`,
additionalLineageSource = @`
    ,
    "environmentDescription": "${model.getEnvironmentDescription()}"
`
)