@import de.ingrid.igeserver.profiles.ingrid_hmdk.importer.GeodatasetMapperHMDK
@param GeodatasetMapperHMDK model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "publicationHmbTG": ${model.getPublicationHmbTG()},
    "informationHmbTG": @template.imports.ingrid.partial.key-values(list = model.getInformationHmbTG())
`)