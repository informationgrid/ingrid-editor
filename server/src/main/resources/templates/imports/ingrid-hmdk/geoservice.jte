@import de.ingrid.igeserver.profiles.ingrid_hmdk.importer.GeoserviceMapperHMDK
@param GeoserviceMapperHMDK model

@template.imports.ingrid.geoservice(model = model, contentInfo = @`
    ,
    "publicationHmbTG": "${model.getPublicationHmbTG()}",
    "informationHmbTG": @template.imports.ingrid.partial.key-values(list = model.getInformationHmbTG())
`)