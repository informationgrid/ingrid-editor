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
    "gauge": [
        @for(var entry : ForSupport.of(model.getGauge()))
            {
                "name": @if(entry.get().getDeviceName() != null) "${entry.get().getDeviceName()}" @else null @endif,
                "id": @if(entry.get().getDeviceId() != null) "${entry.get().getDeviceId()}" @else null @endif,
                "model": @if(entry.get().getDeviceModel() != null) "${entry.get().getDeviceModel()}" @else null @endif,
                "description": @if(entry.get().getDescription() != null) "${entry.get().getDescription()}" @else null @endif
            }@if (!entry.isLast()),@endif
        @endfor
    ],
    "targetParameters": [
        @for(var entry : ForSupport.of(model.getTargetParameters()))
            {
                "name": @template.imports.ingrid.partial.key-value(item = entry.get().getParameterName()),
                "type": @template.imports.ingrid.partial.key-value(item = entry.get().getParameterType()),
                "unitOfMeasurement": @template.imports.ingrid.partial.key-value(item = entry.get().getUom()),
                "formula": @if(entry.get().getParameterFunction() != null) "${entry.get().getParameterFunction()}" @else null @endif
            }@if (!entry.isLast()),@endif
        @endfor
    ],
    "measurementPhases": [
        {
            "type": "waterMeasurement",
            @if(model.getWaterMeasurement() != null)
                "spatiality": @template.imports.ingrid.partial.key-value(item = model.getWaterMeasurement().getSpatiality()),
                "measuringDepth":
                        {
                            "value": ${model.getWaterMeasurement().getMeasuringDepth().getValue()},
                            "verticalSpatialSystems": @template.imports.ingrid.partial.key-value(item = model.getWaterMeasurement().getMeasuringDepth().getVerticalCRS())
                        },
                "timestep": @if(model.getWaterMeasurement().getTimestep() != null) ${model.getWaterMeasurement().getTimestep()} @else null @endif,
                "frequency": @if(model.getWaterMeasurement().getFrequency() != null) ${model.getWaterMeasurement().getFrequency()} @else null @endif,
                "averageWaterLevel": [
                    @for(var entry : ForSupport.of(model.getWaterMeasurement().getAverageWaterLevel()))
                        {
                            "value": @if(entry.get().getValue() != null) ${entry.get().getValue()} @else null @endif,
                            "unitOfMeasurement": @template.imports.ingrid.partial.key-value(item = entry.get().getUnit())
                        }@if (!entry.isLast()),@endif
                    @endfor
                ],
                "zeroLevel": [
                    @for(var entry : ForSupport.of(model.getWaterMeasurement().getZeroLevel()))
                        {
                            "value": @if(entry.get().getValue() != null) ${entry.get().getValue()} @else null @endif,
                            "unitOfMeasurement": @template.imports.ingrid.partial.key-value(item = entry.get().getUnit()),
                            "verticalSpatialSystems": @template.imports.ingrid.partial.key-value(item = entry.get().getVerticalCRS()),
                            "description": @if(entry.get().getDescription() != null) "${entry.get().getDescription()}" @else null @endif
                        }@if (!entry.isLast()),@endif
                    @endfor
                ],
                "drain": {
                    "min": @if(model.getWaterMeasurement().getDrain().getMin() != null) ${model.getWaterMeasurement().getDrain().getMin()} @else null @endif,
                    "max": @if(model.getWaterMeasurement().getDrain().getMax() != null) ${model.getWaterMeasurement().getDrain().getMax()} @else null @endif
                },
                "dataQualityDescription": @if(model.getWaterMeasurement().getDataQualityDescription() != null) "${model.getWaterMeasurement().getDataQualityDescription()}" @else null @endif
            @else
                "spatiality": null,
                "measuringDepth": [],
                "timestep": @if(model.getTimestep() != null) ${model.getTimestep()} @else null @endif,
                "frequency": null,
                "averageWaterLevel": [],
                "zeroLevel": [],
                "drain": { "min": null, "max": null },
                "dataQualityDescription": null
            @endif
        }
    ]
`)
