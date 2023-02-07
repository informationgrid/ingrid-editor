@import de.ingrid.igeserver.exporter.model.KeyValueModel
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.DateEvent
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel

@param IngridModel page
<gmd:fileIdentifier>
    <gco:CharacterString>${page.getUuid()}</gco:CharacterString>
</gmd:fileIdentifier>
<gmd:language>
    <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/" codeListValue="${page.getMetadataLanguage()}" />
</gmd:language>
<gmd:characterSet>
    <gmd:MD_CharacterSetCode
            codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_CharacterSetCode"
            codeListValue="${page.getCharacterSetCode()}" />
</gmd:characterSet>
@if(page.getParentIdentifier() != null)
    <gmd:parentIdentifier>
        <gco:CharacterString>${page.getParentIdentifier()}</gco:CharacterString>
    </gmd:parentIdentifier>
@endif
@if(page.getHierarchyLevel() != null)
    <gmd:hierarchyLevel>
        <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode"
                          codeListValue="${page.getHierarchyLevel()}">${page.getHierarchyLevel()}</gmd:MD_ScopeCode>
    </gmd:hierarchyLevel>
    @if(page.getHierarchyLevelName() != null)
        <gmd:hierarchyLevelName>
            <gco:CharacterString>${page.getHierarchyLevelName()}</gco:CharacterString>
        </gmd:hierarchyLevelName>
    @endif
@endif
<gmd:contact>
    !{var address = page.getPointOfContact();}
    @if(address != null)
        <idf:idfResponsibleParty type="100" uuid="${address.getUuid()}">
            <gmd:organisationName>
                <gco:CharacterString>${address.getNamePresentation()}</gco:CharacterString>
            </gmd:organisationName>
            <gmd:contactInfo>
                <gmd:CI_Contact>
                    <gmd:address>
                        <gmd:CI_Address>
                            <gmd:electronicMailAddress>
                                <gco:CharacterString>${address.getEmail()}</gco:CharacterString>
                            </gmd:electronicMailAddress>
                        </gmd:CI_Address>
                    </gmd:address>
                </gmd:CI_Contact>
            </gmd:contactInfo>
            <gmd:role>
                <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                                 codeListValue="pointOfContact" />
            </gmd:role>
        </idf:idfResponsibleParty>
    @endif
</gmd:contact>
<gmd:dateStamp>
    <gco:Date>${page.getModifiedMetadataDate()}</gco:Date>
</gmd:dateStamp>
<gmd:metadataStandardName>
    <gco:CharacterString>${page.getMdStandardName()}</gco:CharacterString>
</gmd:metadataStandardName>
<gmd:metadataStandardVersion>
    <gco:CharacterString>${page.getMdStandardVersion()}</gco:CharacterString>
</gmd:metadataStandardVersion>
@for(KeyValueModel spatialSystem : page.getSpatialSystems())
    <gmd:referenceSystemInfo>
        <gmd:MD_ReferenceSystem>
            <gmd:referenceSystemIdentifier>
                <gmd:RS_Identifier>
                    @if(spatialSystem.getKey() != null)
                        <gmd:code>
                            <gmx:Anchor
                                    xlink:href="http://www.opengis.net/def/crs/EPSG/0/${spatialSystem.getKey()}">${spatialSystem.getValue()}</gmx:Anchor>
                        </gmd:code>
                    @else
                        <gmd:code>${spatialSystem.getValue()}</gmd:code>
                    @endif
                </gmd:RS_Identifier>
            </gmd:referenceSystemIdentifier>
        </gmd:MD_ReferenceSystem>
    </gmd:referenceSystemInfo>
@endfor

<gmd:identificationInfo>
    <gmd:MD_DataIdentification uuid="${page.getDatasetURL()}">
        <gmd:citation>
            <gmd:CI_Citation>
                <gmd:title>
                    <gco:CharacterString>${page.getTitle()}</gco:CharacterString>
                </gmd:title>
                @for(String advGroup : page.getAdvProductGroups())
                    <gmd:alternateTitle>
                        <gco:CharacterString>${advGroup}</gco:CharacterString>
                    </gmd:alternateTitle>
                @endfor
                @if(page.getAlternateTitle() != null)
                    <gmd:alternateTitle>
                        <gco:CharacterString>${page.getAlternateTitle()}</gco:CharacterString>
                    </gmd:alternateTitle>
                @endif
                @if( page.getDateEvents().isEmpty() )
                    <gmd:date gco:nilReason="missing"></gmd:date>
                @else
                    @for(DateEvent event : page.getDateEvents())
                    <gmd:date>
                        <gmd:CI_Date>
                            <gmd:date>
                                <gco:DateTime>${page.formatDate(page.getFormatterISO(), event.getReferenceDate())}</gco:DateTime>
                            </gmd:date>
                            <gmd:dateType>
                                <gmd:CI_DateTypeCode
                                        codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode"
                                        codeListValue="${page.getCodelistValue("502", event.getReferenceDateType(), "iso")}" />
                            </gmd:dateType>
                        </gmd:CI_Date>
                    </gmd:date>
                    @endfor
                @endif
            </gmd:CI_Citation>
        </gmd:citation>
        <gmd:abstract>
            <gco:CharacterString>${page.getDescription()}</gco:CharacterString>
        </gmd:abstract>
        <gmd:pointOfContact>
            <%--                TODO                             --%>
        </gmd:pointOfContact>

        @template.ingrid.descriptiveKeywords(thesaurus = page.getInspireKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getFreeKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getOpendataKeyword())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getOpendataCategoryKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getAdvCompatibleKeyword())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getInspireRelevantKeyword())

        @template.ingrid.spatial(page = page)

        @for(String language : page.getDataLanguages())
            <gmd:language>
                <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/" codeListValue="${language}" />
            </gmd:language>
        @endfor
    </gmd:MD_DataIdentification>
</gmd:identificationInfo>

