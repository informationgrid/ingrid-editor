@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.SimParameter
@import java.util.Map
@param Map<String, Object> map

!{var page = ((GeodatasetTransformerBaw)map.get("model"));}


@template.export.ingrid.idf.idf-geodataset(map = map,
additionalCitation = @`
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
                                <gmd:valueUnit>ss</gmd:valueUnit>
                                <gmd:value>
                                    <gco:Record xsi:type="xs:double">${page.getTimestep()}</gco:Record>
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
                                    <gmd:valueUnit gco:nilReason="inapplicable"/>
                                @else
                                    <gmd:valueUnit>${param.getUnit()}</gmd:valueUnit>
                                @endif
                                @if(param.getValues().isEmpty())
                                    <gmd:value gco:nilReason="unknown"/>
                                @endif
                                @for(String value : param.getValues())
                                    <gmd:value>
                                        <gco:Record xsi:type="xs:${param.getValueType()}">${value}</gco:Record>
                                    </gmd:value>
                                @endfor
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
