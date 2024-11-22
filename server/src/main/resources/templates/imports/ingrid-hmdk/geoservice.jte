@import de.ingrid.igeserver.profiles.ingrid_hmdk.importer.GeoserviceMapperHMDK
@param GeoserviceMapperHMDK model

@template.imports.ingrid.geoservice(model = model, contentInfo = @`
    ,
    "informationHmbTG": @template.imports.ingrid.partial.key-values(list = model.getInformationHmbTG())
`, additionalProperties = @`
    , "publicationHmbTG": ${model.getPublicationHmbTG()}
`)
