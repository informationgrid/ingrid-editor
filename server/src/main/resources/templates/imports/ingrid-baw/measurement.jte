@import de.ingrid.igeserver.profiles.ingrid_baw.importer.GeodatasetMapperBaw
@import gg.jte.support.ForSupport
@param GeodatasetMapperBaw model

@template.imports.ingrid-baw.geodatasetBase(model = model, typeSpecificFields = @`
    ,
    "measuringMethod":  [
    @for (var entry : ForSupport.of(model.getMeasuringMethod()))
        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
    @endfor
    ],
    "gauge": [],
    "targetParameters": [],
    "measurementPhases": [
        {
            "type": "waterMeasurement",
            "spatiality": null,
            "measuringDepth": [],
            "timestep": @if(model.getTimestep() != null) ${model.getTimestep()} @else null @endif,
            "frequency": null,
            "averageWaterLevel": [],
            "zeroLevel": [],
            "drain": { "min": null, "max": null },
            "dataQualityDescription": null
        }
    ]
`)
