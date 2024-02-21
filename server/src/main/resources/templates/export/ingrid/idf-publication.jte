@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.PublicationModelTransformer
@import java.util.Map

@param Map<String, Object> map

!{var page = ((PublicationModelTransformer)map.get("model"));}
!{var publication = page.getPublication();}
@template.export.template-idf(content = @`
    @template.export.ingrid.shared-general(page = page, additionalCitation =  @`
        @if(publication != null)
            @if(TransformationTools.hasValue(publication.getPublicationDate()))
                <gmd:editionDate>
                    <gco:Date>${publication.getPublicationDate()}</gco:Date>
                </gmd:editionDate>
            @endif
            @if(TransformationTools.hasValue(publication.getAuthor()))
                <gmd:citedResponsibleParty>
                    <gmd:CI_ResponsibleParty>
                        <gmd:individualName>
                            <gco:CharacterString>${publication.getAuthor()}</gco:CharacterString>
                        </gmd:individualName>
                        <gmd:role>
                            <gmd:CI_RoleCode
                                    codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                                    codeListValue="originator" />
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:citedResponsibleParty>
            @endif
            @if(TransformationTools.hasValue(publication.getLocation()))
                <gmd:citedResponsibleParty>
                    <gmd:CI_ResponsibleParty>
                        <gmd:organisationName>
                            <gco:CharacterString>Contact instructions for the location of resource</gco:CharacterString>
                        </gmd:organisationName>
                        <gmd:contactInfo>
                            <gmd:CI_Contact>
                                <gmd:contactInstructions>
                                    <gco:CharacterString>${publication.getLocation()}</gco:CharacterString>
                                </gmd:contactInstructions>
                            </gmd:CI_Contact>
                        </gmd:contactInfo>
                        <gmd:role>
                            <gmd:CI_RoleCode
                                    codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                                    codeListValue="resourceProvider" />
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:citedResponsibleParty>
            @endif
            @if(TransformationTools.hasValue(publication.getPublisher()) || TransformationTools.hasValue(publication.getPlaceOfPublication()))
                <gmd:citedResponsibleParty>
                    <gmd:CI_ResponsibleParty>
                        <gmd:individualName>
                            <gco:CharacterString>${page.getPublisherOrPlaceholder()}</gco:CharacterString>
                        </gmd:individualName>
                        @if(TransformationTools.hasValue(publication.getPlaceOfPublication()))
                            <gmd:contactInfo>
                                <gmd:CI_Contact>
                                    <gmd:address>
                                        <gmd:CI_Address>
                                            <gmd:city>
                                                <gco:CharacterString>${publication.getPlaceOfPublication()}</gco:CharacterString>
                                            </gmd:city>
                                        </gmd:CI_Address>
                                    </gmd:address>
                                </gmd:CI_Contact>
                            </gmd:contactInfo>
                        @endif
                        <gmd:role>
                            <gmd:CI_RoleCode
                                    codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                                    codeListValue="publisher" />
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:citedResponsibleParty>
                @if(TransformationTools.hasValue(publication.getPublishingHouse()))
                    <gmd:citedResponsibleParty>
                        <gmd:CI_ResponsibleParty>
                            <gmd:organisationName>
                                <gco:CharacterString>${publication.getPublishingHouse()}</gco:CharacterString>
                            </gmd:organisationName>
                            <gmd:role>
                                <gmd:CI_RoleCode
                                        codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                                        codeListValue="distribute" />
                            </gmd:role>
                        </gmd:CI_ResponsibleParty>
                    </gmd:citedResponsibleParty>
                @endif
                @if(publication.hasSeriesInfo())
                    <gmd:series>
                        <gmd:CI_Series>
                            @if(TransformationTools.hasValue(publication.getPublishedIn()))
                                <gmd:name>
                                    <gco:CharacterString>${publication.getPublishedIn()}</gco:CharacterString>
                                </gmd:name>
                            @endif
                            @if(TransformationTools.hasValue(publication.getVolume()))
                                <gmd:issueIdentification>
                                    <gco:CharacterString>${publication.getVolume()}</gco:CharacterString>
                                </gmd:issueIdentification>
                            @endif
                            @if(TransformationTools.hasValue(publication.getPages()))
                                <gmd:page>
                                    <gco:CharacterString>${publication.getPages()}</gco:CharacterString>
                                </gmd:page>
                            @endif
                        </gmd:CI_Series>
                    </gmd:series>
                @endif
                @if(TransformationTools.hasValue(publication.getBibliographicData()))
                    <gmd:otherCitationDetails>
                        <gco:CharacterString>${publication.getBibliographicData()}</gco:CharacterString>
                    </gmd:otherCitationDetails>
                @endif
                @if(TransformationTools.hasValue(publication.getIsbn()))
                    <gmd:ISBN>
                        <gco:CharacterString>${publication.getIsbn()}</gco:CharacterString>
                    </gmd:ISBN>
                @endif
            @endif
        @endif
    `)
    @if(TransformationTools.hasValue(page.getBaseDataText()))
        <gmd:dataQualityInfo>
            <gmd:DQ_DataQuality>
                <gmd:scope>
                    <gmd:DQ_Scope>
                        <gmd:level>
                            <gmd:MD_ScopeCode
                                    codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode"
                                    codeListValue="nonGeographicDataset" />
                        </gmd:level>
                        <gmd:levelDescription>
                            <gmd:MD_ScopeDescription>
                                <gmd:other>
                                    <gco:CharacterString>literature</gco:CharacterString>
                                </gmd:other>
                            </gmd:MD_ScopeDescription>
                        </gmd:levelDescription>
                    </gmd:DQ_Scope>
                </gmd:scope>
                <gmd:lineage>
                    <gmd:LI_Lineage>
                        <gmd:source>
                            <gmd:LI_Source>
                                <gmd:description>
                                    <gco:CharacterString>${page.getBaseDataText()}</gco:CharacterString>
                                </gmd:description>
                            </gmd:LI_Source>
                        </gmd:source>
                    </gmd:LI_Lineage>
                </gmd:lineage>
            </gmd:DQ_DataQuality>
        </gmd:dataQualityInfo>
    @endif
`, abstract_text = page.getDescription())
