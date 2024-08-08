@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.InformationSystemModelTransformer
@import java.util.Map

@param Map<String, Object> map

!{var page = ((InformationSystemModelTransformer)map.get("model"));}
@template.export.template-idf(content = @`
    @template.export.ingrid.idf.shared-general(page = page)
    @if(page.hasDataQualityInfo())
        <gmd:dataQualityInfo>
            <gmd:DQ_DataQuality>
                <gmd:scope>
                    <gmd:DQ_Scope>
                        <gmd:level>
                            <gmd:MD_ScopeCode
                                    codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode"
                                    codeListValue="application" />
                        </gmd:level>
                        <gmd:levelDescription>
                            <gmd:MD_ScopeDescription>
                                <gmd:other>
                                    <gco:CharacterString>information system</gco:CharacterString>
                                </gmd:other>
                            </gmd:MD_ScopeDescription>
                        </gmd:levelDescription>
                    </gmd:DQ_Scope>
                </gmd:scope>
                <gmd:lineage>
                    <gmd:LI_Lineage>
                        @if (TransformationTools.hasValue(page.getImplementationHistory()))
                            <gmd:processStep>
                                <gmd:LI_ProcessStep>
                                    <gmd:description>
                                        <gco:CharacterString>${page.getImplementationHistory()}</gco:CharacterString>
                                    </gmd:description>
                                </gmd:LI_ProcessStep>
                            </gmd:processStep>
                        @endif
                        @if (TransformationTools.hasValue(page.getBaseDataText()))
                            <gmd:source>
                                <gmd:LI_Source>
                                    <gmd:description>
                                        <gco:CharacterString>${page.getBaseDataText()}</gco:CharacterString>
                                    </gmd:description>
                                </gmd:LI_Source>
                            </gmd:source>
                        @endif
                    </gmd:LI_Lineage>
                </gmd:lineage>
            </gmd:DQ_DataQuality>
        </gmd:dataQualityInfo>
    @endif
`, abstract_text = page.getDescription())
