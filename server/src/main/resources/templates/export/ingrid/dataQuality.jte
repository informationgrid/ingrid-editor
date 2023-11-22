@import de.ingrid.igeserver.exporter.TransformationTools;
@import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer.DisplayableQuality
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.ConformanceResult

@param GeodatasetModelTransformer page
<gmd:dataQualityInfo>
    <gmd:DQ_DataQuality>
        <gmd:scope>
            <gmd:DQ_Scope>
                <gmd:level>
                    <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="dataset"/>
                </gmd:level>
            </gmd:DQ_Scope>
        </gmd:scope>
        @if( page.getCompletenessOmission() != null)
        <gmd:report>
            <gmd:DQ_CompletenessOmission>
                <gmd:nameOfMeasure>
                    <gco:CharacterString>Rate of missing items</gco:CharacterString>
                </gmd:nameOfMeasure>
                <gmd:measureIdentification>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>7</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:measureIdentification>
                <gmd:measureDescription>
                    <gco:CharacterString>completeness omission (rec_grade)</gco:CharacterString>
                </gmd:measureDescription>
                <gmd:result>
                    <gmd:DQ_QuantitativeResult>
                        <gmd:valueUnit>
                            <gml:UnitDefinition gml:id="unitDefinition_ID_d9654c07-5c27-4ab8-8260-60995d63c2c7">
                                <gml:identifier codeSpace=""/>
                                <gml:name>percent</gml:name>
                                <gml:quantityType>completeness omission</gml:quantityType>
                                <gml:catalogSymbol>%</gml:catalogSymbol>
                            </gml:UnitDefinition>
                        </gmd:valueUnit>
                        <gmd:value>
                            <gco:Record>${page.getCompletenessOmission()}</gco:Record>
                        </gmd:value>
                    </gmd:DQ_QuantitativeResult>
                </gmd:result>
            </gmd:DQ_CompletenessOmission>
        </gmd:report>
        @endif
        @if( page.getVerticalPositionalAccuracy() != null)
        <gmd:report>
            <gmd:DQ_AbsoluteExternalPositionalAccuracy>
                <gmd:nameOfMeasure>
                    <gco:CharacterString>Mean value of positional uncertainties (1D)</gco:CharacterString>
                </gmd:nameOfMeasure>
                <gmd:measureIdentification>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>28</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:measureIdentification>
                <gmd:measureDescription>
                    <gco:CharacterString>vertical</gco:CharacterString>
                </gmd:measureDescription>
                <gmd:result>
                    <gmd:DQ_QuantitativeResult>
                        <gmd:valueUnit>
                            <gml:UnitDefinition gml:id="unitDefinition_ID_8696c492-8846-41e0-b848-7178203c448e">
                                <gml:identifier codeSpace=""/>
                                <gml:name>meter</gml:name>
                                <gml:quantityType>absolute external positional accuracy, vertical accuracy</gml:quantityType>
                                <gml:catalogSymbol>m</gml:catalogSymbol>
                            </gml:UnitDefinition>
                        </gmd:valueUnit>
                        <gmd:value>
                            <gco:Record>${page.getVerticalPositionalAccuracy()}</gco:Record>
                        </gmd:value>
                    </gmd:DQ_QuantitativeResult>
                </gmd:result>
            </gmd:DQ_AbsoluteExternalPositionalAccuracy>
        </gmd:report>
        @endif
        @if( page.getGriddedDataPositionalAccuracy() != null)
        <gmd:report>
            <gmd:DQ_GriddedDataPositionalAccuracy>
                <gmd:nameOfMeasure>
                    <gco:CharacterString>Root mean square error of planimetry</gco:CharacterString>
                </gmd:nameOfMeasure>
                <gmd:measureIdentification>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>47</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:measureIdentification>
                <gmd:result>
                    <gmd:DQ_QuantitativeResult>
                        <gmd:valueUnit>
                            <gml:UnitDefinition gml:id="unitDefinition_ID_3edd1913-769e-4ab9-a31d-17854572f198">
                                <gml:identifier codeSpace=""/>
                                <gml:name>meter</gml:name>
                                <gml:quantityType>absolute external positional accuracy</gml:quantityType>
                                <gml:catalogSymbol>m</gml:catalogSymbol>
                            </gml:UnitDefinition>
                        </gmd:valueUnit>
                        <gmd:value>
                            <gco:Record>${page.getGriddedDataPositionalAccuracy()}</gco:Record>
                        </gmd:value>
                    </gmd:DQ_QuantitativeResult>
                </gmd:result>
            </gmd:DQ_GriddedDataPositionalAccuracy>
        </gmd:report>
        @endif
        @if( page.getHorizontalPositionalAccuracy() != null)
        <gmd:report>
            <gmd:DQ_AbsoluteExternalPositionalAccuracy>
                <gmd:nameOfMeasure>
                    <gco:CharacterString>Mean value of positional uncertainties (2D)</gco:CharacterString>
                </gmd:nameOfMeasure>
                <gmd:measureIdentification>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>28</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:measureIdentification>
                <gmd:measureDescription>
                    <gco:CharacterString>geographic</gco:CharacterString>
                </gmd:measureDescription>
                <gmd:result>
                    <gmd:DQ_QuantitativeResult>
                        <gmd:valueUnit>
                            <gml:UnitDefinition gml:id="unitDefinition_ID_${TransformationTools.getRandomUUID()}">
                                <gml:identifier codeSpace=""/>
                                <gml:name>meter</gml:name>
                                <gml:quantityType>absolute external positional accuracy, geographic accuracy</gml:quantityType>
                                <gml:catalogSymbol>m</gml:catalogSymbol>
                            </gml:UnitDefinition>
                        </gmd:valueUnit>
                        <gmd:value>
                            <gco:Record>${page.getHorizontalPositionalAccuracy()}</gco:Record>
                        </gmd:value>
                    </gmd:DQ_QuantitativeResult>
                </gmd:result>
            </gmd:DQ_AbsoluteExternalPositionalAccuracy>
        </gmd:report>
        @endif
        @for( ConformanceResult conformanceResult : page.getConformanceResult() )
        <gmd:report>
            <gmd:DQ_DomainConsistency>
                <gmd:result>
                    <gmd:DQ_ConformanceResult>
                        <gmd:specification>
                            <gmd:CI_Citation>
                                <gmd:title>
                                    <gco:CharacterString>${page.getCodelists().getValue("6005",conformanceResult.getSpecification(), "iso")}</gco:CharacterString>
                                </gmd:title>
                                <gmd:date>
                                    <gmd:CI_Date>
                                        <gmd:date>
                                            <gco:Date>${conformanceResult.getPublicationDate()}</gco:Date>
                                        </gmd:date>
                                        <gmd:dateType>
                                            <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="publication">publication</gmd:CI_DateTypeCode>
                                        </gmd:dateType>
                                    </gmd:CI_Date>
                                </gmd:date>
                            </gmd:CI_Citation>
                        </gmd:specification>
                        @if( conformanceResult.getExplanation() != null)
                        <gmd:explanation>
                            <gco:CharacterString>${conformanceResult.getExplanation()}</gco:CharacterString>
                        </gmd:explanation>
                        @endif
                        @if( conformanceResult.getPass().getKey().equals("3"))
                        <gmd:pass gco:nilReason="unknown"/>
                        @else
                        <gmd:pass>
                            <gco:Boolean>${conformanceResult.getPass().getKey().equals("1") ? "true" : "false"}</gco:Boolean>
                        </gmd:pass>
                        @endif
                    </gmd:DQ_ConformanceResult>
                </gmd:result>
            </gmd:DQ_DomainConsistency>
        </gmd:report>
        @endfor

        @for( DisplayableQuality quality : page.getQualities() )
            <gmd:report>
                <gmd:${quality.getTagName()}>
                    <gmd:nameOfMeasure>
                        <gco:CharacterString>${quality.getNameOfMeasure()}</gco:CharacterString>
                    </gmd:nameOfMeasure>
                    @if( quality.getMeasureIdentification() != null)
                        @if( quality.getMeasureIdentification().equals("missing"))
                            <gmd:measureIdentification gco:nilReason="missing"/>
                        @else
                            <gmd:measureIdentification>
                                <gmd:MD_Identifier>
                                    <gmd:code>
                                        <gco:CharacterString>${quality.getMeasureIdentification()}</gco:CharacterString>
                                    </gmd:code>
                                </gmd:MD_Identifier>
                            </gmd:measureIdentification>
                        @endif
                    @endif
                    @if( quality.getMeasureDescription() != null)
                    <gmd:measureDescription>
                        <gco:CharacterString>${quality.getMeasureDescription()}</gco:CharacterString>
                    </gmd:measureDescription>
                    @endif
                    <gmd:result>
                        <gmd:DQ_QuantitativeResult>
                            $unsafe{quality.getUnitDefinition()}
                            <gmd:value>
                                <gco:Record>${quality.getValue()}</gco:Record>
                            </gmd:value>
                        </gmd:DQ_QuantitativeResult>
                    </gmd:result>
                </gmd:${quality.getTagName()}>
            </gmd:report>
        @endfor


        @if( page.getHasLineageInformation())
        <gmd:lineage>
            <gmd:LI_Lineage>
                @if( page.getLineageStatement() != null)
                <gmd:statement>
                    <gco:CharacterString>${page.getLineageStatement()}</gco:CharacterString>
                </gmd:statement>
                @endif
                @for( String processDescription : page.getLineageProcessStepDescriptions())
                <gmd:processStep>
                    <gmd:LI_ProcessStep>
                        <gmd:description>
                            <gco:CharacterString>${processDescription}</gco:CharacterString>
                        </gmd:description>
                    </gmd:LI_ProcessStep>
                </gmd:processStep>
                @endfor
                @for( String description : page.getLineageSourceDescriptions())
                <gmd:source>
                    <gmd:LI_Source>
                        <gmd:description>
                            <gco:CharacterString>${description}</gco:CharacterString>
                        </gmd:description>
                    </gmd:LI_Source>
                </gmd:source>
                @endfor
            </gmd:LI_Lineage>
        </gmd:lineage>
        @endif
    </gmd:DQ_DataQuality>
</gmd:dataQualityInfo>
