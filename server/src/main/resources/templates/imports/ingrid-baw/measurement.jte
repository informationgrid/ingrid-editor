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
                "deviceName": @if(entry.get().getDeviceName() != null) "${entry.get().getDeviceName()}" @else null @endif,
                "deviceId": @if(entry.get().getDeviceId() != null) "${entry.get().getDeviceId()}" @else null @endif,
                "deviceModel": @if(entry.get().getDeviceModel() != null) "${entry.get().getDeviceModel()}" @else null @endif,
                "description": @if(entry.get().getDescription() != null) "${entry.get().getDescription()}" @else null @endif
            }@if (!entry.isLast()),@endif
        @endfor
    ],
    "targetParameters": [
        @for(var entry : ForSupport.of(model.getTargetParameters()))
            {
                "parameterName": @if(entry.get().getParameterName() != null) "${entry.get().getParameterName()}" @else null @endif,
                "parameterType": @template.imports.ingrid.partial.key-value(item = entry.get().getParameterType()),
                "uom": @if(entry.get().getUom() != null) "${entry.get().getUom()}" @else null @endif,
                "parameterFunction": @if(entry.get().getParameterFunction() != null) "${entry.get().getParameterFunction()}" @else null @endif
            }@if (!entry.isLast()),@endif
        @endfor
    ],
    "measurementPhases": [
        {
            "type": "waterMeasurement",
            @if(model.getWaterMeasurement() != null)
                "spatiality": @template.imports.ingrid.partial.key-value(item = model.getWaterMeasurement().getSpatiality()),
                "measuringDepth": [
                    @for(var entry : ForSupport.of(model.getWaterMeasurement().getMeasuringDepth()))
                        {
                            "value": @if(entry.get().getValue() != null) ${entry.get().getValue()} @else null @endif,
                            "unit": @if(entry.get().getUnit() != null) "${entry.get().getUnit()}" @else null @endif,
                            "verticalCRS": @template.imports.ingrid.partial.key-value(item = entry.get().getVerticalCRS()),
                            "description": @if(entry.get().getDescription() != null) "${entry.get().getDescription()}" @else null @endif
                        }@if (!entry.isLast()),@endif
                    @endfor
                ],
                "timestep": @if(model.getWaterMeasurement().getTimestep() != null) ${model.getWaterMeasurement().getTimestep()} @else null @endif,
                "frequency": @if(model.getWaterMeasurement().getFrequency() != null) ${model.getWaterMeasurement().getFrequency()} @else null @endif,
                "averageWaterLevel": [
                    @for(var entry : ForSupport.of(model.getWaterMeasurement().getAverageWaterLevel()))
                        {
                            "value": @if(entry.get().getValue() != null) ${entry.get().getValue()} @else null @endif,
                            "unit": @if(entry.get().getUnit() != null) "${entry.get().getUnit()}" @else null @endif
                        }@if (!entry.isLast()),@endif
                    @endfor
                ],
                "zeroLevel": [
                    @for(var entry : ForSupport.of(model.getWaterMeasurement().getZeroLevel()))
                        {
                            "value": @if(entry.get().getValue() != null) ${entry.get().getValue()} @else null @endif,
                            "unit": @if(entry.get().getUnit() != null) "${entry.get().getUnit()}" @else null @endif,
                            "verticalCRS": @template.imports.ingrid.partial.key-value(item = entry.get().getVerticalCRS()),
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
