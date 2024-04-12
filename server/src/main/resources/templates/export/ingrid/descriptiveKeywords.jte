@import de.ingrid.igeserver.exporter.model.CharacterStringModel
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.KeywordIso
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
@import java.util.List

@param List<Thesaurus> thesauri
    @for(Thesaurus thesaurus : thesauri)
        <%-- only show template if keywords exist  --%>
        @if(!thesaurus.getKeywords().isEmpty())
        <gmd:descriptiveKeywords>
            <gmd:MD_Keywords>
                @for( KeywordIso keyword :  thesaurus.getKeywords())
                    <gmd:keyword@if(keyword.getAlternateValue() != null) xsi:type="gmd:PT_FreeText_PropertyType"@endif>
                        @if(keyword.getLink() != null)
                            <gmx:Anchor xlink:href="${keyword.getLink()}">${keyword.getName()}</gmx:Anchor>
                        @else
                            <gco:CharacterString>${keyword.getName()}</gco:CharacterString>
                        @endif
                        @if(keyword.getAlternateValue() != null)
                            <gmd:PT_FreeText>
                                <gmd:textGroup>
                                    <gmd:LocalisedCharacterString locale="#eng_utf8">${keyword.getAlternateValue()}</gmd:LocalisedCharacterString>
                                </gmd:textGroup>
                            </gmd:PT_FreeText>
                        @endif
                    </gmd:keyword>
                @endfor
                @if(thesaurus.getName() != null )
                    @if(thesaurus.getShowType())
                        <gmd:type>
                            <gmd:MD_KeywordTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="${thesaurus.getType()}"/>
                        </gmd:type>
                    @endif
                    @if(!thesaurus.getName().isEmpty())
                    <gmd:thesaurusName>
                        <gmd:CI_Citation>
                            <gmd:title>
                                @template.export.ingrid.anchorOrCharacterString(model = new CharacterStringModel(thesaurus.getName(), thesaurus.getLink()))
                            </gmd:title>
                            <gmd:date>
                                <gmd:CI_Date>
                                    <gmd:date>
                                        <gco:Date>${thesaurus.getDate()}</gco:Date>
                                    </gmd:date>
                                    <gmd:dateType>
                                        <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="${thesaurus.getDateType()}">${thesaurus.getDateType()}</gmd:CI_DateTypeCode>
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
    @endfor