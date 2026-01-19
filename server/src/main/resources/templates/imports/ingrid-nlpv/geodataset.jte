@import de.ingrid.igeserver.profiles.ingrid_nlpv.importer.GeodatasetMapperNLPV
@param GeodatasetMapperNLPV model

@template.imports.ingrid.geodataset(model = model, contentInfo = @`
    ,
    "fees": "${model.getFees()}"
`, additionalMetadata = @`
    , "maintenanceInformation": {
          !{var interval = model.getMetadataMaintenanceInterval();}
          "maintenanceAndUpdateFrequency": @template.imports.ingrid.partial.key-value(item = interval.getInterval()),
          "userDefinedMaintenanceFrequency": {
              @if(interval.getValue() != null)"number": ${interval.getValue()},@endif
              "unit": @template.imports.ingrid.partial.key-value(item = interval.getUnit())
          },
          "description": "${interval.getDescription()}"
      }
`)