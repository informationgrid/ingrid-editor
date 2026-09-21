@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.CitedResponsibleParty
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.LiteratureAggregate
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.*
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.MeasurementDepth
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.SimParameter
@import java.util.Map

@param Map<String, Object> map

!{var page = ((GeodatasetTransformerBaw)map.get("model"));}


@template.export.ingrid.idf.idf-geodataset(map = map,
aggregateInformation = @`
    @if(TransformationTools.hasValue(page.getOrderTitle()) && TransformationTools.hasValue(page.getOrderNumber()))
        <gmd:aggregationInfo>
            <gmd:MD_AggregateInformation>
                <gmd:aggregateDataSetName>
                    <gmd:CI_Citation>
                        <gmd:title>
                            <gco:CharacterString>${page.getOrderTitle()}</gco:CharacterString>
                        </gmd:title>
                        <gmd:date gco:nilReason="unknown" />
                        <gmd:identifier>
                            <gmd:MD_Identifier>
                                <gmd:code>
                                    <gco:CharacterString>${page.getOrderNumber()}</gco:CharacterString>
                                </gmd:code>
                            </gmd:MD_Identifier>
                        </gmd:identifier>
                    </gmd:CI_Citation>
                </gmd:aggregateDataSetName>
                <gmd:associationType>
                    <gmd:DS_AssociationTypeCode
                            codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#DS_AssociationTypeCode"
                            codeListValue="largerWorkCitation" />
                </gmd:associationType>
            </gmd:MD_AggregateInformation>
        </gmd:aggregationInfo>
    @endif
    @for(LiteratureAggregate lit : page.getLiteratureAggregates())
        <gmd:aggregationInfo>
            <gmd:MD_AggregateInformation>
                <gmd:aggregateDataSetName uuidref="${lit.getUuid()}">
                    <gmd:CI_Citation>
                        <gmd:title>
                            <gco:CharacterString>${lit.getTitle()}</gco:CharacterString>
                        </gmd:title>
                        @if(TransformationTools.hasValue(lit.getPubDate()))
                        <gmd:date>
                            <gmd:CI_Date>
                                <gmd:date>
                                    <gco:Date>${lit.getPubDate()}</gco:Date>
                                </gmd:date>
                                <gmd:dateType>
                                    <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#gmd:CI_DateTypeCode" codeListValue="publication">publication</gmd:CI_DateTypeCode>
                                </gmd:dateType>
                            </gmd:CI_Date>
                        </gmd:date>
                        @endif
                        @for( String identifier : lit.getIdentifiers() )
                        <gmd:identifier>
                            <gmd:MD_Identifier>
                                <gmd:code>
                                    <gco:CharacterString>${identifier}</gco:CharacterString>
                                </gmd:code>
                            </gmd:MD_Identifier>
                        </gmd:identifier>
                        @endfor
                        @for(CitedResponsibleParty party : lit.getCitedParties())
                        <gmd:citedResponsibleParty>
                            <gmd:CI_ResponsibleParty uuid="${party.getUuid()}">
                                @if( TransformationTools.hasValue(party.getIndividualName()) )
                                <gmd:individualName>
                                    <gco:CharacterString>${party.getIndividualName()}</gco:CharacterString>
                                </gmd:individualName>
                                @endif
                                @if( TransformationTools.hasValue(party.getOrganisationName()) )
                                <gmd:organisationName>
                                    <gco:CharacterString>${party.getOrganisationName()}</gco:CharacterString>
                                </gmd:organisationName>
                                @endif
                                <gmd:role>
                                    <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="${party.getRole()}">${party.getRole()}</gmd:CI_RoleCode>
                                </gmd:role>
                            </gmd:CI_ResponsibleParty>
                        </gmd:citedResponsibleParty>
                    @endfor
                    </gmd:CI_Citation>
                </gmd:aggregateDataSetName>
                <gmd:associationType>
                    <gmd:DS_AssociationTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#DS_AssociationTypeCode" codeListValue="crossReference">crossReference</gmd:DS_AssociationTypeCode>
                </gmd:associationType>
            </gmd:MD_AggregateInformation>
        </gmd:aggregationInfo>
    @endfor
`,
additionalIdentification = @`
    @if(page.isBawSimulation() || page.isBawMeasurement())
        <gmd:supplementalInformation>
            <baw:BAW_Metadata xmlns:baw="https://dl.datenrepository.baw.de/schemas/bawmd">
                @if(page.isBawSimulation())
                    <baw:simulation>
                        <baw:Simulation>
                            @if(TransformationTools.hasValue(page.getProcess()))
                                <baw:simulationMethod>
                                    <gco:CharacterString>${page.getProcess()}</gco:CharacterString>
                                </baw:simulationMethod>
                            @endif
                            @for(String version : page.getSimulationVersion())
                                <baw:simulationMethodVersion>
                                    <gco:CharacterString>${version}</gco:CharacterString>
                                </baw:simulationMethodVersion>
                            @endfor
                            @for(String dep : page.getSimulationExtension())
                                <baw:simulationMethodDependency>
                                    <gco:CharacterString>${dep}</gco:CharacterString>
                                </baw:simulationMethodDependency>
                            @endfor
                            @if(TransformationTools.hasValue(page.getDimensionality()))
                                <baw:spatialDimensionality>
                                    <gco:CharacterString>${page.getDimensionality()}</gco:CharacterString>
                                </baw:spatialDimensionality>
                            @endif
                            @if(page.getTimestep() != null)
                                <baw:timeStepSize>
                                    <gco:Decimal>${page.getTimestep()}</gco:Decimal>
                                </baw:timeStepSize>
                            @endif
                            @for(String modelType : page.getModelType())
                                <baw:simulationModelType>
                                    <gco:CharacterString>${modelType}</gco:CharacterString>
                                </baw:simulationModelType>
                            @endfor
                            @for(SimParameter param : page.getSimulationParameters())
                                <baw:simulationParameter>
                                    <baw:SimulationParameter>
                                        <baw:parameterName>
                                            <gco:CharacterString>${param.getName()}</gco:CharacterString>
                                        </baw:parameterName>
                                        <baw:parameterType>
                                            <gco:CharacterString>${param.getRole()}</gco:CharacterString>
                                        </baw:parameterType>
                                        <baw:parameterValues>
                                            <gco:RecordType>${param.getValue()}</gco:RecordType>
                                        </baw:parameterValues>
                                        <baw:uom>
                                            <gco:CharacterString>${param.getUnit()}</gco:CharacterString>
                                        </baw:uom>
                                    </baw:SimulationParameter>
                                </baw:simulationParameter>
                            @endfor
                            !{var cfdS = page.getCfdSimulation();}
                            @if(cfdS != null)
                                <baw:shipCFD>
                                    <baw:ShipCFD>
                                        @for(String shipName : cfdS.getShipNames())
                                            <baw:shipName>
                                                <gco:CharacterString>${shipName}</gco:CharacterString>
                                            </baw:shipName>
                                        @endfor
                                        @if(TransformationTools.hasValue(cfdS.getPhysics()))
                                            <baw:statementAboutPhysics>
                                                <gco:CharacterString>${cfdS.getPhysics()}</gco:CharacterString>
                                            </baw:statementAboutPhysics>
                                        @endif
                                        @if(cfdS.getConstantCrossSection() != null)
                                            <baw:constantCrossSection>
                                                <gco:Boolean>${cfdS.getConstantCrossSection()}</gco:Boolean>
                                            </baw:constantCrossSection>
                                        @endif
                                        @if(cfdS.getPropulsion() != null)
                                            <baw:propulsion>
                                                <gco:Boolean>${cfdS.getPropulsion()}</gco:Boolean>
                                            </baw:propulsion>
                                        @endif
                                        @if(TransformationTools.hasValue(cfdS.getMovementType()))
                                            <baw:movementTypes>
                                                <gco:CharacterString>${cfdS.getMovementType()}</gco:CharacterString>
                                            </baw:movementTypes>
                                        @endif
                                        @if(TransformationTools.hasValue(cfdS.getTrajectory()))
                                            <baw:trajectory>
                                                <gco:CharacterString>${cfdS.getTrajectory()}</gco:CharacterString>
                                            </baw:trajectory>
                                        @endif
                                        @if(TransformationTools.hasValue(cfdS.getCellCount()))
                                            <baw:cellCount>
                                                <gco:Integer>${cfdS.getCellCount()}</gco:Integer>
                                            </baw:cellCount>
                                        @endif
                                    </baw:ShipCFD>
                                </baw:shipCFD>
                            @endif
                            !{var bautechnikS = page.getBautechnikSimulation();}
                            @if(bautechnikS != null)
                                <baw:structuralEngineeringSimulation>
                                    <baw:StructuralEngineeringSimulation>
                                        @for(String obj : bautechnikS.getObjects())
                                            <baw:object>
                                                <gco:CharacterString>${obj}</gco:CharacterString>
                                            </baw:object>
                                        @endfor
                                        @for(String part : bautechnikS.getObjectParts())
                                            <baw:objectPart>
                                                <gco:CharacterString>${part}</gco:CharacterString>
                                            </baw:objectPart>
                                        @endfor
                                        @for(String goal : bautechnikS.getResearchGoals())
                                            <baw:investigationGoal>
                                                <gco:CharacterString>${goal}</gco:CharacterString>
                                            </baw:investigationGoal>
                                        @endfor
                                        @if(TransformationTools.hasValue(bautechnikS.getSpatialDimension()))
                                            <baw:spatialDimensionality>
                                                <gco:CharacterString>${bautechnikS.getSpatialDimension()}</gco:CharacterString>
                                            </baw:spatialDimensionality>
                                        @endif
                                        @if(bautechnikS.getTimeDimension() != null)
                                            <baw:timeDimension>
                                                <gco:Boolean>${bautechnikS.getTimeDimension()}</gco:Boolean>
                                            </baw:timeDimension>
                                        @endif
                                        @for(String level : bautechnikS.getLevels())
                                            <baw:investigationLevel>
                                                <gco:CharacterString>${level}</gco:CharacterString>
                                            </baw:investigationLevel>
                                        @endfor
                                        @for(String phase : bautechnikS.getPhases())
                                            <baw:investigationStage>
                                                <gco:CharacterString>${phase}</gco:CharacterString>
                                            </baw:investigationStage>
                                        @endfor
                                        @if(bautechnikS.getCalculationConcept() != null)
                                            @if(bautechnikS.getCalculationConcept().getMaterialLinear() != null)
                                                <baw:materialConcept>
                                                    <gco:CharacterString>${bautechnikS.getCalculationConcept().getMaterialLinear() ? "linear" : "nonlinear"}</gco:CharacterString>
                                                </baw:materialConcept>
                                            @endif
                                            @if(bautechnikS.getCalculationConcept().getGeometricLinear() != null)
                                                <baw:geometryConcept>
                                                    <gco:CharacterString>${bautechnikS.getCalculationConcept().getGeometricLinear() ? "linear" : "nonlinear"}</gco:CharacterString>
                                                </baw:geometryConcept>
                                            @endif
                                            @if(bautechnikS.getCalculationConcept().getImperfections() != null)
                                                <baw:imperfections>
                                                    <gco:CharacterString>${bautechnikS.getCalculationConcept().getImperfections() ? "with" : "without"}</gco:CharacterString>
                                                </baw:imperfections>
                                            @endif
                                        @endif
                                        @for(String material : bautechnikS.getMaterials())
                                            <baw:materials>
                                                <gco:CharacterString>${material}</gco:CharacterString>
                                            </baw:materials>
                                        @endfor
                                        @if(bautechnikS.getMaterialParameters() != null)
                                            @for(var r : bautechnikS.getMaterialParameters().getReinforcement())
                                                @if(r.getYieldLimit() != null)
                                                    <baw:reinforcementYieldStrength>
                                                        <gco:Decimal>${r.getYieldLimit()}</gco:Decimal>
                                                    </baw:reinforcementYieldStrength>
                                                @endif
                                            @endfor
                                            @for(var s : bautechnikS.getMaterialParameters().getSteel())
                                                @if(s.getYieldLimit() != null)
                                                    <baw:steelYieldStrength>
                                                        <gco:Decimal>${s.getYieldLimit()}</gco:Decimal>
                                                    </baw:steelYieldStrength>
                                                @endif
                                            @endfor
                                            @if(!bautechnikS.getMaterialParameters().getConcrete().isEmpty())
                                                <baw:concreteCompressiveStrength>
                                            @for(var concreteEntry : bautechnikS.getMaterialParameters().getConcrete())
                                                        <baw:ConcreteCompressiveStrength>
                                                            <baw:concreteCompressiveStrength>
                                                                <gco:Decimal>${concreteEntry.getValue()}</gco:Decimal>
                                                            </baw:concreteCompressiveStrength>
                                                            <baw:parameter>
                                                                <gco:CharacterString>${concreteEntry.getUnit()}</gco:CharacterString>
                                                            </baw:parameter>
                                                        </baw:ConcreteCompressiveStrength>
                                            @endfor
                                                    </baw:concreteCompressiveStrength>
                                            @endif
                                        @endif
                                        @for(String model : bautechnikS.getMaterialModels())
                                            <baw:materialModel>
                                                <gco:CharacterString>${model}</gco:CharacterString>
                                            </baw:materialModel>
                                        @endfor
                                        @for(String elementType : bautechnikS.getElementTypes())
                                            <baw:elementType>
                                                <gco:CharacterString>${elementType}</gco:CharacterString>
                                            </baw:elementType>
                                        @endfor
                                        @for(String einwirkung : bautechnikS.getEffects())
                                            <baw:impact>
                                                <gco:CharacterString>${einwirkung}</gco:CharacterString>
                                            </baw:impact>
                                        @endfor
                                        @for(String physics : bautechnikS.getPhysics())
                                            <baw:physics>
                                                <gco:CharacterString>${physics}</gco:CharacterString>
                                            </baw:physics>
                                        @endfor
                                        @for(String analysis : bautechnikS.getAnalysisTypes())
                                            <baw:analysisType>
                                                <gco:CharacterString>${analysis}</gco:CharacterString>
                                            </baw:analysisType>
                                        @endfor
                                    </baw:StructuralEngineeringSimulation>
                                </baw:structuralEngineeringSimulation>
                            @endif
                        </baw:Simulation>
                    </baw:simulation>
                @endif
                @if(page.isBawMeasurement())
                    <baw:measurement>
                        <baw:Measurement>
                            @for(String method : page.getMeasuringMethod())
                                <baw:measurementMethod>
                                    <gco:CharacterString>${method}</gco:CharacterString>
                                </baw:measurementMethod>
                            @endfor
                            @for(MeasurementDevice device : page.getMeasurementDevices())
                                <baw:measurementDevice>
                                    <baw:MeasurementDevice>
                                        @if(TransformationTools.hasValue(device.getName()))
                                            <baw:deviceName>
                                                <gco:CharacterString>${device.getName()}</gco:CharacterString>
                                            </baw:deviceName>
                                        @endif
                                        @if(TransformationTools.hasValue(device.getId()))
                                            <baw:deviceId>
                                                <gco:CharacterString>${device.getId()}</gco:CharacterString>
                                            </baw:deviceId>
                                        @endif
                                        @if(TransformationTools.hasValue(device.getModel()))
                                            <baw:deviceModel>
                                                <gco:CharacterString>${device.getModel()}</gco:CharacterString>
                                            </baw:deviceModel>
                                        @endif
                                        @if(TransformationTools.hasValue(device.getDescription()))
                                            <baw:description>
                                                <gco:CharacterString>${device.getDescription()}</gco:CharacterString>
                                            </baw:description>
                                        @endif
                                    </baw:MeasurementDevice>
                                </baw:measurementDevice>
                            @endfor
                            @for(TargetParameter param : page.getTargetParameters())
                                <baw:measurementParameter>
                                    <baw:MeasurementParameter>
                                        @if(TransformationTools.hasValue(param.getName()))
                                            <baw:parameterName>
                                                <gco:CharacterString>${param.getName()}</gco:CharacterString>
                                            </baw:parameterName>
                                        @endif
                                        @if(TransformationTools.hasValue(param.getType()))
                                            <baw:parameterType>
                                                <gco:CharacterString>${param.getType()}</gco:CharacterString>
                                            </baw:parameterType>
                                        @endif
                                        @if(TransformationTools.hasValue(param.getFormula()))
                                            <baw:parameterFunction>
                                                <gco:CharacterString>${param.getFormula()}</gco:CharacterString>
                                            </baw:parameterFunction>
                                        @endif
                                        @if(TransformationTools.hasValue(param.getUnit()))
                                            <baw:uom>
                                                <gco:CharacterString>${param.getUnit()}</gco:CharacterString>
                                            </baw:uom>
                                        @endif
                                    </baw:MeasurementParameter>
                                </baw:measurementParameter>
                            @endfor
                            <baw:hydraulicEngineeringMeasurement>
                                <baw:HydraulicEngineeringMeasurement>
                                    @if(TransformationTools.hasValue(page.getSpatiality()))
                                        <baw:measurementSpatiality>
                                            <gco:CharacterString>${page.getSpatiality()}</gco:CharacterString>
                                        </baw:measurementSpatiality>
                                    @endif
                                    @if(TransformationTools.hasValue(page.getTimestep()))
                                        <baw:temporalAccuracy>
                                            <gco:Decimal>${page.getTimestep()}</gco:Decimal>
                                        </baw:temporalAccuracy>
                                    @endif
                                    @if(TransformationTools.hasValue(page.getFrequency()))
                                        <baw:measurementFrequency>
                                            <gco:Decimal>${page.getFrequency()}</gco:Decimal>
                                        </baw:measurementFrequency>
                                    @endif
                                    @if(page.getMeasuringDepth() != null)
                                        <baw:measurementDepth>
                                            <baw:MeasurementDepth>
                                                @if(TransformationTools.hasValue(page.getMeasuringDepth().getValue()))
                                                    <baw:measurementDepth>
                                                        <gco:Decimal>${page.getMeasuringDepth().getValue()}</gco:Decimal>
                                                    </baw:measurementDepth>
                                                @endif
                                                @if(page.getMeasuringDepth().getCrs() != null)
                                                    <baw:verticalCRS>
                                                        @template.export.ingrid.idf.anchorOrCharacterString(model = page.getMeasuringDepth().getCrs())
                                                    </baw:verticalCRS>
                                                @endif
                                            </baw:MeasurementDepth>
                                        </baw:measurementDepth>
                                    @endif
                                    @for(ZeroLevel level : page.getZeroLevel())
                                        <baw:gaugeZeroPoint>
                                            <baw:GaugeZeroPoint>
                                                @if(TransformationTools.hasValue(level.getValue()))
                                                    <baw:gaugeZeroPoint>
                                                        <gco:Decimal>${level.getValue()}</gco:Decimal>
                                                    </baw:gaugeZeroPoint>
                                                @endif
                                                @if(TransformationTools.hasValue(level.getUnit()))
                                                    <baw:uom>
                                                        <gco:CharacterString>${level.getUnit()}</gco:CharacterString>
                                                    </baw:uom>
                                                @endif
                                                @if(TransformationTools.hasValue(level.getCrs()))
                                                    <baw:verticalCRS>
                                                        <gco:CharacterString>${level.getCrs()}</gco:CharacterString>
                                                    </baw:verticalCRS>
                                                @endif
                                                @if(TransformationTools.hasValue(level.getDescription()))
                                                    <baw:description>
                                                        <gco:CharacterString>${level.getDescription()}</gco:CharacterString>
                                                    </baw:description>
                                                @endif
                                            </baw:GaugeZeroPoint>
                                        </baw:gaugeZeroPoint>
                                    @endfor
                                    @for(AverageWaterLevel level : page.getAverageWaterLevel())
                                        <baw:meanWaterLevel>
                                            <baw:MeanWaterLevel>
                                                @if(TransformationTools.hasValue(level.getValue()))
                                                    <baw:waterLevel>
                                                        <gco:Decimal>${level.getValue()}</gco:Decimal>
                                                    </baw:waterLevel>
                                                @endif
                                                @if(TransformationTools.hasValue(level.getUnit()))
                                                    <baw:uom>
                                                        <gco:CharacterString>${level.getUnit()}</gco:CharacterString>
                                                    </baw:uom>
                                                @endif
                                            </baw:MeanWaterLevel>
                                        </baw:meanWaterLevel>
                                    @endfor
                                    @if(TransformationTools.hasValue(page.getMinDrain()))
                                        <baw:minDischarge>
                                            <gco:Decimal>${page.getMinDrain()}</gco:Decimal>
                                        </baw:minDischarge>
                                    @endif
                                    @if(TransformationTools.hasValue(page.getMaxDrain()))
                                        <baw:maxDischarge>
                                            <gco:Decimal>${page.getMaxDrain()}</gco:Decimal>
                                        </baw:maxDischarge>
                                    @endif
                                    @if(TransformationTools.hasValue(page.getDataQualityDescription()))
                                        <baw:dataQualityDescription>
                                            <gco:CharacterString>${page.getDataQualityDescription()}</gco:CharacterString>
                                        </baw:dataQualityDescription>
                                    @endif
                                </baw:HydraulicEngineeringMeasurement>
                            </baw:hydraulicEngineeringMeasurement>
                        </baw:Measurement>
                    </baw:measurement>
                @endif
            </baw:BAW_Metadata>
        </gmd:supplementalInformation>
    @endif
`,
extraContent = @`
    @if( TransformationTools.hasValue(page.getTimestep()) )
        <gmd:dataQualityInfo>
            <gmd:DQ_DataQuality>
                <gmd:scope>
                    <gmd:DQ_Scope>
                        <gmd:level>
                            <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="model"/>
                        </gmd:level>
                    </gmd:DQ_Scope>
                </gmd:scope>
                <gmd:report>
                    <gmd:DQ_AccuracyOfATimeMeasurement>
                        <gmd:result>
                            <gmd:DQ_QuantitativeResult>
                                <gmd:valueUnit>
                                    <gml:UnitDefinition gml:id="unitDefinition_ID_${TransformationTools.getRandomUUID()}">
                                        <gml:identifier codeSpace=""/>
                                        <gml:name>second</gml:name>
                                        <gml:catalogSymbol>s</gml:catalogSymbol>
                                    </gml:UnitDefinition>
                                </gmd:valueUnit>
                                <gmd:value>
                                    <gco:Record>${page.getTimestep()}</gco:Record>
                                </gmd:value>
                            </gmd:DQ_QuantitativeResult>
                        </gmd:result>
                    </gmd:DQ_AccuracyOfATimeMeasurement>
                </gmd:report>
            </gmd:DQ_DataQuality>
        </gmd:dataQualityInfo>
    @endif
    @for( SimParameter param : page.getSimulationParameters() )
        <gmd:dataQualityInfo>
            <gmd:DQ_DataQuality>
                <gmd:scope>
                    <gmd:DQ_Scope>
                        <gmd:level>
                            <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="model"/>
                        </gmd:level>
                    </gmd:DQ_Scope>
                </gmd:scope>
                <gmd:report>
                    <gmd:DQ_QuantitativeAttributeAccuracy>
                        <gmd:result>
                            <gmd:DQ_QuantitativeResult>
                                <gmd:valueType>
                                    <gco:RecordType>${param.getName()}</gco:RecordType>
                                </gmd:valueType>
                                @if(TransformationTools.hasValue(param.getUnit()))
                                    <gmd:valueUnit>
                                        <gml:UnitDefinition gml:id="unitDefinition_ID_${TransformationTools.getRandomUUID()}">
                                            <gml:identifier codeSpace=""/>
                                            <gml:catalogSymbol>${param.getUnit()}</gml:catalogSymbol>
                                        </gml:UnitDefinition>
                                    </gmd:valueUnit>
                                @else
                                    <gmd:valueUnit gco:nilReason="inapplicable"/>
                                @endif
                                @if(TransformationTools.hasValue(param.getValue()))
                                    <gmd:value>
                                        <gco:Record>${param.getValue()}</gco:Record>
                                    </gmd:value>
                                @else
                                    <gmd:value gco:nilReason="unknown"/>
                                @endif
                            </gmd:DQ_QuantitativeResult>
                        </gmd:result>
                    </gmd:DQ_QuantitativeAttributeAccuracy>
                </gmd:report>
                <gmd:lineage>
                    <gmd:LI_Lineage>
                        <gmd:source>
                            <gmd:LI_Source>
                                <gmd:description>
                                    <gco:CharacterString>${param.getRole()}</gco:CharacterString>
                                </gmd:description>
                            </gmd:LI_Source>
                        </gmd:source>
                    </gmd:LI_Lineage>
                </gmd:lineage>
            </gmd:DQ_DataQuality>
        </gmd:dataQualityInfo>
    @endfor
`
)
