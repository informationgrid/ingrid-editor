@import de.ingrid.igeserver.profiles.ingrid.exporter.GeodataserviceModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.ConformanceResult
@import java.util.Map

@param Map<String, Object> map

!{var page = ((GeodataserviceModelTransformer)map.get("model"));}

@template.template-idf(content = @`
    @template.ingrid.shared-general(page = page)

    <gmd:dataQualityInfo>
        <gmd:DQ_DataQuality>
            <gmd:scope>
                <gmd:DQ_Scope>
                    <gmd:level>
                        <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="service"/>
                    </gmd:level>
                    <gmd:levelDescription>
                        <gmd:MD_ScopeDescription>
                            <gmd:other>
                                <gco:CharacterString>3</gco:CharacterString>
                            </gmd:other>
                        </gmd:MD_ScopeDescription>
                    </gmd:levelDescription>
                </gmd:DQ_Scope>
            </gmd:scope>
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
        </gmd:DQ_DataQuality>
    </gmd:dataQualityInfo>
    <gmd:dataQualityInfo>
        <gmd:DQ_DataQuality>
            <gmd:scope>
                <gmd:DQ_Scope>
                    <gmd:level>
                        <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="service"/>
                    </gmd:level>
                    <gmd:levelDescription>
                        <gmd:MD_ScopeDescription>
                            <gmd:other>
                                <gco:CharacterString>3</gco:CharacterString>
                            </gmd:other>
                        </gmd:MD_ScopeDescription>
                    </gmd:levelDescription>
                </gmd:DQ_Scope>
            </gmd:scope>
            @if(page.getHistory() != null)
            <gmd:lineage>
                <gmd:LI_Lineage>
                    <gmd:processStep>
                        <gmd:LI_ProcessStep>
                            <gmd:description>
                                <gco:CharacterString>${page.getHistory()}</gco:CharacterString>
                            </gmd:description>
                        </gmd:LI_ProcessStep>
                    </gmd:processStep>
                </gmd:LI_Lineage>
            </gmd:lineage>
            @endif
        </gmd:DQ_DataQuality>
    </gmd:dataQualityInfo>
`, abstract_text = page.getDescription())
