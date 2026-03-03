@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.CitedResponsibleParty
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.LiteratureAggregate
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.TestProcedure
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.*
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.SimParameter
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.TargetParameter
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
    !{var lab = page.getLaboratoryData();}
    @if(lab != null)
        <labordaten>
            @for(String reason : lab.getDataCollectionReason())
                <AnlassDerDatenerhebung>
                    <anlassDerDatenerhebung>${reason}</anlassDerDatenerhebung>
                </AnlassDerDatenerhebung>
            @endfor
            @for(String origin : lab.getSampleOrigin())
                <Probenherkunft>
                    <probenherkunft>${origin}</probenherkunft>
                </Probenherkunft>
            @endfor
            @for(String material : lab.getTestedMaterial())
                <GeprueftesMaterial>
                    <geprueftesMaterial>${material}</geprueftesMaterial>
                </GeprueftesMaterial>
            @endfor
            @for(TestProcedure tp : lab.getTestProcedures())
                <MessUndPruefverfahren>
                    @if(TransformationTools.hasValue(tp.getTestMethod()))
                        <messUndPruefverfahren>${tp.getTestMethod()}</messUndPruefverfahren>
                    @endif
                    @if(TransformationTools.hasValue(tp.getInstrument()))
                        <messgeraete>${tp.getInstrument()}</messgeraete>
                    @endif
                    @if(TransformationTools.hasValue(tp.getStandard()))
                        <Norm>
                            <normBezeichnung>${tp.getStandard()}</normBezeichnung>
                            @if(TransformationTools.hasValue(tp.getStandardIssueDate()))
                                <ausgabedatum>${tp.getStandardIssueDate()}</ausgabedatum>
                            @endif
                        </Norm>
                    @endif
                </MessUndPruefverfahren>
            @endfor
            <Zulassungspruefung>
                <zulassungspruefung>
                    <gco:Boolean>${lab.isApprovalProcedure()}</gco:Boolean>
                </zulassungspruefung>
                @if(TransformationTools.hasValue(lab.getTestNumber()))
                    <pruefnummer>${lab.getTestNumber()}</pruefnummer>
                @endif
                @if(TransformationTools.hasValue(lab.getSystemSetup()))
                    <aufbauDesSystems>${lab.getSystemSetup()}</aufbauDesSystems>
                @endif
                @for(String visibility : lab.getDatasetVisibility())
                    <Sichtbarkeit>
                        <sichtbarkeit>${visibility}</sichtbarkeit>
                    </Sichtbarkeit>
                @endfor
            </Zulassungspruefung>
        </labordaten>
    @endif
    !{var bautechnikM = page.getBautechnikMeasurement();}
    @if(bautechnikM != null)
        <bautechnikMessdaten>
            @for(String goal : bautechnikM.getResearchGoals())
                <Untersuchungsziel>
                    <untersuchungsziel>${goal}</untersuchungsziel>
                </Untersuchungsziel>
            @endfor
            @if(TransformationTools.hasValue(bautechnikM.getMeasurementType()))
                <artDerMessung>${bautechnikM.getMeasurementType()}</artDerMessung>
            @endif
            @if(TransformationTools.hasValue(bautechnikM.getWindID()))
                <objektIdentNrWind>${bautechnikM.getWindID()}</objektIdentNrWind>
            @endif
            @if(TransformationTools.hasValue(bautechnikM.getMeasurementDirection()))
                <messrichtung>${bautechnikM.getMeasurementDirection()}</messrichtung>
            @endif
            @for(String param : bautechnikM.getParameters())
                <Messgroessen>
                    <messgroessen>${param}</messgroessen>
                </Messgroessen>
            @endfor
        </bautechnikMessdaten>
    @endif
    !{var bautechnikS = page.getBautechnikSimulation();}
    @if(bautechnikS != null)
        <bautechnikSimulationsdaten>
            @if(bautechnikS.getSoftware() != null)
                <Software>
                    <name>${bautechnikS.getSoftware().getName()}</name>
                    <version>${bautechnikS.getSoftware().getVersion()}</version>
                </Software>
            @endif
            @for(String obj : bautechnikS.getObjects())
                <Objekt>
                    <objekt>${obj}</objekt>
                </Objekt>
            @endfor
            @for(String part : bautechnikS.getObjectParts())
                <Objektteil>
                    <objektteil>${part}</objektteil>
                </Objektteil>
            @endfor
            @for(String goal : bautechnikS.getResearchGoals())
                <Untersuchungsziel>
                    <untersuchungsziel>${goal}</untersuchungsziel>
                </Untersuchungsziel>
            @endfor
            <Dimensionen>
                @if(TransformationTools.hasValue(bautechnikS.getSpatialDimension()))
                    <raeumlicheDimensionen>${bautechnikS.getSpatialDimension()}</raeumlicheDimensionen>
                @endif
                @if(bautechnikS.getTimeDimension() != null)
                    <zeit>
                        <gco:Boolean>${bautechnikS.getTimeDimension()}</gco:Boolean>
                    </zeit>
                @endif
            </Dimensionen>
            @for(String level : bautechnikS.getLevels())
                <LevelDerUntersuchung>
                    <levelDerUntersuchung>${level}</levelDerUntersuchung>
                </LevelDerUntersuchung>
            @endfor
            @for(String phase : bautechnikS.getPhases())
                <Untersuchungsstufe>
                    <untersuchungsstufe>${phase}</untersuchungsstufe>
                </Untersuchungsstufe>
            @endfor
            @if(bautechnikS.getCalculationConcept() != null)
                <Berechnungskonzepte>
                    @if(bautechnikS.getCalculationConcept().getMaterialLinear() != null)
                        <materiellLinear>
                            <gco:Boolean>${bautechnikS.getCalculationConcept().getMaterialLinear()}</gco:Boolean>
                        </materiellLinear>
                    @endif
                    @if(bautechnikS.getCalculationConcept().getGeometricLinear() != null)
                        <geometrischLinear>
                            <gco:Boolean>${bautechnikS.getCalculationConcept().getGeometricLinear()}</gco:Boolean>
                        </geometrischLinear>
                    @endif
                    @if(bautechnikS.getCalculationConcept().getImperfections() != null)
                        <imperfektionen>
                            <gco:Boolean>${bautechnikS.getCalculationConcept().getImperfections()}</gco:Boolean>
                        </imperfektionen>
                    @endif
                </Berechnungskonzepte>
            @endif
            @for(String material : bautechnikS.getMaterials())
                <Werkstoffe>
                    <werkstoffe>${material}</werkstoffe>
                </Werkstoffe>
            @endfor
            @if(bautechnikS.getMaterialParameters() != null)
                <GrundlegendeWerkstoffparameter>
                    @for(var r : bautechnikS.getMaterialParameters().getReinforcement())
                        <Bewehrung>
                            <fliessgrenzeBewehrung>${r.getYieldLimit()}</fliessgrenzeBewehrung>
                        </Bewehrung>
                    @endfor
                    @for(var s : bautechnikS.getMaterialParameters().getSteel())
                        <Stahl>
                            <fliessgrenzeStahl>${s.getYieldLimit()}</fliessgrenzeStahl>
                        </Stahl>
                    @endfor
                    @for(var c : bautechnikS.getMaterialParameters().getConcrete())
                        <Betondruckfestigkeit>
                            <betondruckfestigkeit>${c.getValue()}</betondruckfestigkeit>
                            <einheit>${c.getUnit()}</einheit>
                        </Betondruckfestigkeit>
                    @endfor
                </GrundlegendeWerkstoffparameter>
            @endif
            @for(String model : bautechnikS.getMaterialModels())
                <Materialmodell>
                    <materialmodell>${model}</materialmodell>
                </Materialmodell>
            @endfor
            @for(String elementType : bautechnikS.getElementTypes())
                <Elementtypen>
                    <elementtypen>${elementType}</elementtypen>
                </Elementtypen>
            @endfor
            @for(String einwirkung : bautechnikS.getEffects())
                <Einwirkung>
                    <einwirkung>${einwirkung}</einwirkung>
                </Einwirkung>
            @endfor
            @for(String physics : bautechnikS.getPhysics())
                <Physik>
                    <physik>${physics}</physik>
                </Physik>
            @endfor
            @for(String analysis : bautechnikS.getAnalysisTypes())
                <Analysetyp>
                    <analysetyp>${analysis}</analysetyp>
                </Analysetyp>
            @endfor
        </bautechnikSimulationsdaten>
    @endif
`,
additionalIdentification = @`
    <measurementInfo>
        @for(String method : page.getMeasuringMethod())
            <MeasurementMethod>
                <measurementMethod>${method}</measurementMethod>
            </MeasurementMethod>
        @endfor
        @if(TransformationTools.hasValue(page.getSpatiality()))
            <spatialOrientation>${page.getSpatiality()}</spatialOrientation>
        @endif
        @if(page.getMeasuringDepth() != null)
            <MeasurementDepth>
                <depth>${page.getMeasuringDepth().getValue()}</depth>
                <uom>m</uom>
                <verticalCRS>${page.getMeasuringDepth().getCrs()}</verticalCRS>
            </MeasurementDepth>
        @endif
        @if(TransformationTools.hasValue(page.getFrequency()))
            <measurementFrequency>${page.getFrequency()}</measurementFrequency>
        @endif
        @for(AverageWaterLevel level : page.getAverageWaterLevel())
            <MeanWaterLevel>
                <waterLevel>${level.getValue()}</waterLevel>
                <uom>${level.getUnit()}</uom>
            </MeanWaterLevel>
        @endfor
        @for(ZeroLevel level : page.getZeroLevel())
            <GaugeDatum>
                <datum>${level.getValue()}</datum>
                <uom>${level.getUnit()}</uom>
                <verticalCRS>${level.getCrs()}</verticalCRS>
                <description>${level.getDescription()}</description>
            </GaugeDatum>
        @endfor
        @if(TransformationTools.hasValue(page.getMaxDrain()))
            <maxDischarge>${page.getMaxDrain()}</maxDischarge>
        @endif
        @if(TransformationTools.hasValue(page.getMinDrain()))
            <minDischarge>${page.getMinDrain()}</minDischarge>
        @endif
        @for( MeasurementDevice device : page.getMeasurementDevices())
            <MeasurementDevice>
                <name>${device.getName()}</name>
                <id>${device.getId()}</id>
                <model>${device.getModel()}</model>
                <description>${device.getDescription()}</description>
            </MeasurementDevice>
        @endfor
        @for(TargetParameter param : page.getTargetParameters())
            <MeasuredQuantities>
                <name>${param.getName()}</name>
                <type>${param.getType()}</type>
                <uom>${param.getUnit()}</uom>
                <calculationFormula>${param.getFormula()}</calculationFormula>
            </MeasuredQuantities>
        @endfor
        @if(TransformationTools.hasValue(page.getDataQualityDescription()))
            <dataQualityDescription>${page.getDataQualityDescription()}</dataQualityDescription>
        @endif
    </measurementInfo>
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
