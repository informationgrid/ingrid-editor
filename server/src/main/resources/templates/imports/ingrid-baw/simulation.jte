@import de.ingrid.igeserver.profiles.ingrid_baw.importer.GeodatasetMapperBaw
@import gg.jte.support.ForSupport
@param GeodatasetMapperBaw model


!{var bSim = model.getBautechnikSimulation();}

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
        @if(bSim != null)
            {
                "type": "bautechnikSimulation",
                "object": [
                    @for(var entry : ForSupport.of(bSim.getObjects()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "objectPart": [
                    @for(var entry : ForSupport.of(bSim.getObjectPart()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "researchGoal": [
                    @for(var entry : ForSupport.of(bSim.getResearchGoal()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "dimension": {
                    "spatialDimension": @template.imports.ingrid.partial.key-value(item = bSim.getDimension().getSpatialDimension()),
                    "timeDimension": @if(bSim.getDimension().getTimeDimension() != null) ${bSim.getDimension().getTimeDimension()} @else null @endif
                },
                "level": [
                    @for(var entry : ForSupport.of(bSim.getLevel()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "phase": [
                    @for(var entry : ForSupport.of(bSim.getPhase()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "calculationConcept": @if(bSim.getCalculationConcept() != null)
                    {
                    "isMaterialLinear": @if(bSim.getCalculationConcept().isMaterialLinear() != null) ${bSim.getCalculationConcept().isMaterialLinear()} @else null @endif,
                    "isGeometricLinear": @if(bSim.getCalculationConcept().isGeometricLinear() != null) ${bSim.getCalculationConcept().isGeometricLinear()} @else null @endif,
                    "hasImperfections": @if(bSim.getCalculationConcept().getHasImperfections() != null) ${bSim.getCalculationConcept().getHasImperfections()} @else null @endif
                    }
                @else
                    null
                @endif,
                "materials": [
                    @for(var entry : ForSupport.of(bSim.getMaterials()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "materialParameters": @if(bSim.getMaterialParameters() != null)
                    {
                    "reinforcement": [
                        @for(var entry : ForSupport.of(bSim.getMaterialParameters().getReinforcement()))
                            { "yieldLimit": ${entry.get().getYieldLimit()} }@if (!entry.isLast()),@endif
                        @endfor
                    ],
                    "steel": [
                        @for(var entry : ForSupport.of(bSim.getMaterialParameters().getSteel()))
                            { "yieldLimit": ${entry.get().getYieldLimit()} }@if (!entry.isLast()),@endif
                        @endfor
                    ],
                    "concrete": [
                        @for(var entry : ForSupport.of(bSim.getMaterialParameters().getConcrete()))
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
                    @for(var entry : ForSupport.of(bSim.getMaterialModel()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "elementTypes": [
                    @for(var entry : ForSupport.of(bSim.getElementTypes()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "effects": [
                    @for(var entry : ForSupport.of(bSim.getEffects()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "physics": [
                    @for(var entry : ForSupport.of(bSim.getPhysics()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ],
                "analysisType": [
                    @for(var entry : ForSupport.of(bSim.getAnalysisType()))
                        @template.imports.ingrid.partial.key-value(item = entry.get())@if (!entry.isLast()),@endif
                    @endfor
                ]
            }
        @endif
    ]
`)
