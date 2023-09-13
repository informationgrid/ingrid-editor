@import de.ingrid.igeserver.exporter.model.CharacterStringModel
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus

@param Thesaurus thesaurus
        <%-- only show template if keywords exist  --%>
        @if(!thesaurus.getKeywords().isEmpty())
        <gmd:descriptiveKeywords>
            <gmd:MD_Keywords>
                @for( KeywordIso keyword :  thesaurus.getKeywords())
                <gmd:keyword>
                    @if(keyword.getLink() != null)
                        <gmx:Anchor xlink:href="${keyword.getLink()}">${keyword.getName()}</gmx:Anchor>
                    @else
                        <gco:CharacterString>${keyword.getName()}</gco:CharacterString>
                    @endif
                </gmd:keyword>
<%--                    TODO  keywordAlternateValue / keywordAlternateValue --%>
                @endfor
                @if(thesaurus.getName() != null )
                @if(thesaurus.getShowType())
                <gmd:type>
                    <gmd:MD_KeywordTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="theme"/>
                </gmd:type>
                @endif
                    @if(!thesaurus.getName().isEmpty())
                    <gmd:thesaurusName>
                        <gmd:CI_Citation>
                            <gmd:title>
                                @template.ingrid.anchorOrCharacterString(model = new CharacterStringModel(thesaurus.getName(), thesaurus.getLink()))
                            </gmd:title>
                            <gmd:date>
                                <gmd:CI_Date>
                                    <gmd:date>
                                        <gco:Date>${thesaurus.getDate()}</gco:Date>
                                    </gmd:date>
                                    <gmd:dateType>
                                        <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="publication">publication</gmd:CI_DateTypeCode>
                                    </gmd:dateType>
                                </gmd:CI_Date>
                            </gmd:date>
                        </gmd:CI_Citation>
                    </gmd:thesaurusName>
                    @endif
                @endif
            </gmd:MD_Keywords>
        </gmd:descriptiveKeywords>
        @endif
