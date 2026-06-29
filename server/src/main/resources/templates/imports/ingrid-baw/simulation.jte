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
    "simulationPhases": [
        @if(model.getBautechnikSimulation() != null)
            {
                "type": "bautechnikSimulation",
                "objects": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getObjects()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "objectPart": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getObjectPart()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "researchGoal": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getResearchGoal()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "dimension": {
                    "spatialDimension": @template.imports.ingrid.partial.key-value(item = model.getBautechnikSimulation().getDimension().getSpatialDimension()),
                    "timeDimension": @if(model.getBautechnikSimulation().getDimension().getTimeDimension() != null) ${model.getBautechnikSimulation().getDimension().getTimeDimension()} @else null @endif
                },
                "level": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getLevel()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "phase": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getPhase()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "calculationConcept": @if(model.getBautechnikSimulation().getCalculationConcept() != null)
                    {
                    "isMaterialLinear": @if(model.getBautechnikSimulation().getCalculationConcept().isMaterialLinear() != null) ${model.getBautechnikSimulation().getCalculationConcept().isMaterialLinear()} @else null @endif,
                    "isGeometricLinear": @if(model.getBautechnikSimulation().getCalculationConcept().isGeometricLinear() != null) ${model.getBautechnikSimulation().getCalculationConcept().isGeometricLinear()} @else null @endif,
                    "hasImperfections": @if(model.getBautechnikSimulation().getCalculationConcept().getHasImperfections() != null) ${model.getBautechnikSimulation().getCalculationConcept().getHasImperfections()} @else null @endif
                    }
                @else
                    null
                @endif,
                "materials": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getMaterials()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "materialParameters": @if(model.getBautechnikSimulation().getMaterialParameters() != null)
                    {
                    "reinforcement": [
                        @for(var entry : ForSupport.of(model.getBautechnikSimulation().getMaterialParameters().getReinforcement()))
                            { "yieldLimit": ${entry.get().getYieldLimit()} }@if (!entry.isLast()),@endif
                        @endfor
                    ],
                    "steel": [
                        @for(var entry : ForSupport.of(model.getBautechnikSimulation().getMaterialParameters().getSteel()))
                            { "yieldLimit": ${entry.get().getYieldLimit()} }@if (!entry.isLast()),@endif
                        @endfor
                    ],
                    "concrete": [
                        @for(var entry : ForSupport.of(model.getBautechnikSimulation().getMaterialParameters().getConcrete()))
                            {
                            "compressiveStrength": @if(entry.get().getCompressiveStrength() != null) ${entry.get().getCompressiveStrength()} @else null @endif,
                            "unitOfMeasure": @template.imports.ingrid.partial.key-value(item = entry.get().getUnitOfMeasure())
                            }@if (!entry.isLast()),@endif
                        @endfor
                    ]
                    }
                @else
                    null
                @endif,
                "materialModel": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getMaterialModel()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "elementTypes": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getElementTypes()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "effects": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getEffects()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "physics": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getPhysics()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "analysisType": [
                    @for(var entry : ForSupport.of(model.getBautechnikSimulation().getAnalysisType()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ]
            }
        @endif
    ]
`)
