@import de.ingrid.igeserver.profiles.ingrid_baw.importer.GeodatasetMapperBaw
@import gg.jte.support.ForSupport
@param GeodatasetMapperBaw model

@template.imports.ingrid-baw.geodatasetBase(model = model, typeSpecificFields = @`
    ,
    "timestep": @if(model.getTimestep() != null) ${model.getTimestep()} @else null @endif,
    "simulationParameter": [
        @for(var entry : ForSupport.of(model.getSimulationParameters()))
            {
            "name": "${entry.get().getName()}",
            "role": @template.imports.ingrid.partial.key-value(item = entry.get().getRole()),
            "value": "${entry.get().getValue()}",
            "unit": "${entry.get().getUnit()}"
            }
            @if (!entry.isLast()),@endif
        @endfor
    ],
    "simulationModelType": [
        @for (var entry : ForSupport.of(model.getSimulationModelTypes()))
            @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
        @endfor
    ],
    "dimensionality": @template.imports.ingrid.partial.key-value(item = model.getDimensionality()),
    "process": @template.imports.ingrid.partial.key-value(item = model.getSimProcess()),
    "simulationPhases": []
`)
