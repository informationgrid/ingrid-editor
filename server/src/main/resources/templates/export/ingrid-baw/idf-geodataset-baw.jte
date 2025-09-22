@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.CitedResponsibleParty
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.LiteratureAggregate
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
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
