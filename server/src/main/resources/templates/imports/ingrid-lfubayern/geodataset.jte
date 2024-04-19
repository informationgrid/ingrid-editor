@import de.ingrid.igeserver.profiles.ingrid_lfubayern.importer.GeodatasetMapperLfUBayern
@param GeodatasetMapperLfUBayern model

@template.imports.ingrid.geodataset(model = model, additionalKeywords = @`
    ,
    "geologicalKeywords": @template.imports.ingrid.partial.key-values(list = model.getGeologicalKeywords()),
    "internalKeywords": @template.imports.ingrid.partial.key-values(list = model.getInternalKeywords()),
`)