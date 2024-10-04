@import de.ingrid.igeserver.profiles.ingrid_bkg.importer.GeodatasetMapperBkg
@param GeodatasetMapperBkg model

@template.imports.ingrid.geodataset(model = model, additionalResource = @`
    , "accessConstraintsBkg": @template.imports.ingrid.partial.key-value(item = model.getAccessConstraintBkg().getTitle())
    , "accessConstraintsBkgComment": "${model.getAccessConstraintBkg().getNote()}"
    , "useConstraintsBkg": @template.imports.ingrid.partial.key-value(item = model.getUseConstraintBkg().getTitle())
    , "useConstraintsBkgComment": "${model.getUseConstraintBkg().getNote()}"
    , "useConstraintsBkgSource": "${model.getUseConstraintBkg().getSource()}"
`)
