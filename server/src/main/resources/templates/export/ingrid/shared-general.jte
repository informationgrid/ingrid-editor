@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.exporter.model.KeyValueModel
@import de.ingrid.igeserver.exporter.model.SpatialModel;
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.DateEvent
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel

@param IngridModelTransformer page
!{var spatial = page.getData().getSpatial();}
!{var verticalExtent = spatial.getVerticalExtent();}

<gmd:fileIdentifier>
    <gco:CharacterString>${page.getModel().getUuid()}</gco:CharacterString>
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
                    <gco:CharacterString>${page.getModel().getTitle()}</gco:CharacterString>
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

        <gmd:extent>
            <gmd:EX_Extent>
                @if(spatial.getDescription() != null)
                    <gmd:description>
                        <gco:CharacterString>${spatial.getDescription()}</gco:CharacterString>
                    </gmd:description>
                @endif
                @for(SpatialModel ref : page.getSpatialReferences())
                    @if(ref.getType().equals("free"))
                        @if(ref.getTitle() != null)
                            <gmd:geographicElement>
                                <gmd:EX_GeographicDescription>
                                    <gmd:extentTypeCode>
                                        <gco:Boolean>true</gco:Boolean>
                                    </gmd:extentTypeCode>
                                    <gmd:geographicIdentifier>
                                        <gmd:MD_Identifier>
                                            <gmd:code>
                                                <gco:CharacterString>${ref.getTitle()}</gco:CharacterString>
                                            </gmd:code>
                                        </gmd:MD_Identifier>
                                    </gmd:geographicIdentifier>
                                </gmd:EX_GeographicDescription>
                            </gmd:geographicElement>
                        @endif
                        @if(ref.getValue() != null)
                            <gmd:geographicElement>
                                <gmd:EX_GeographicBoundingBox>
                                    <gmd:extentTypeCode>
                                        <gco:Boolean>true</gco:Boolean>
                                    </gmd:extentTypeCode>
                                    <gmd:westBoundLongitude>
                                        <gco:Decimal>${ref.getValue().getLon1()}</gco:Decimal>
                                    </gmd:westBoundLongitude>
                                    <gmd:eastBoundLongitude>
                                        <gco:Decimal>${ref.getValue().getLon2()}</gco:Decimal>
                                    </gmd:eastBoundLongitude>
                                    <gmd:southBoundLatitude>
                                        <gco:Decimal>${ref.getValue().getLat1()}</gco:Decimal>
                                    </gmd:southBoundLatitude>
                                    <gmd:northBoundLatitude>
                                        <gco:Decimal>${ref.getValue().getLat2()}</gco:Decimal>
                                    </gmd:northBoundLatitude>
                                </gmd:EX_GeographicBoundingBox>
                            </gmd:geographicElement>
                        @endif
                    @elseif(ref.getType().equals("wkt"))
                        <gmd:geographicElement>
                            <gmd:EX_BoundingPolygon>
                                <gmd:extentTypeCode>
                                    <gco:Boolean>true</gco:Boolean>
                                </gmd:extentTypeCode>
                                <gmd:polygon>
                                    ${ref.getWktCoordinatesISO()}
                                </gmd:polygon>
                            </gmd:EX_BoundingPolygon>
                        </gmd:geographicElement>
                    @endif
                @endfor
                @if(verticalExtent != null)
                    <gmd:verticalElement>
                        <gmd:EX_VerticalExtent>
                            <gmd:minimumValue>
                                <gco:Real>${verticalExtent.getMinimumValue()}</gco:Real>
                            </gmd:minimumValue>
                            <gmd:maximumValue>
                                <gco:Real>${verticalExtent.getMaximumValue()}</gco:Real>
                            </gmd:maximumValue>
                            <gmd:verticalCRS>
                                <gml:VerticalCRS gml:id="verticalCRSN_ID_${TransformationTools.getRandomUUID()}">
                                    <gml:identifier codeSpace=""/>
                                    <gml:scope/>
                                    <gml:verticalCS>
                                        <gml:VerticalCS gml:id="verticalCS_ID_${TransformationTools.getRandomUUID()}">
                                            <gml:identifier codeSpace=""/>
                                            <gml:axis>
                                                <gml:CoordinateSystemAxis gml:id="coordinateSystemAxis_ID_${TransformationTools.getRandomUUID()}" uom="${ page.getCodelistValue("102", verticalExtent.getUnitOfMeasure(), "iso")}">
                                                    <gml:identifier codeSpace=""/>
                                                    <gml:axisAbbrev/>
                                                    <gml:axisDirection codeSpace=""/>
                                                </gml:CoordinateSystemAxis>
                                            </gml:axis>
                                        </gml:VerticalCS>
                                    </gml:verticalCS>
                                    <gml:verticalDatum>
                                        <gml:VerticalDatum gml:id="verticalDatum_ID_${TransformationTools.getRandomUUID()}">
                                            <gml:identifier codeSpace=""/>
                                            <gml:name>${page.getCodelistValue("101", verticalExtent.getDatum())}</gml:name>
                                            <gml:scope/>
                                        </gml:VerticalDatum>
                                    </gml:verticalDatum>
                                </gml:VerticalCRS>
                            </gmd:verticalCRS>
                        </gmd:EX_VerticalExtent>
                    </gmd:verticalElement>
                @endif
                @if(page.getRegionKey() != null)
                    <gmd:geographicElement>
                        <gmd:EX_GeographicDescription>
                            <gmd:geographicIdentifier>
                                <gmd:MD_Identifier>
                                    <gmd:code>
                                        <gmx:Anchor xlink:href="https://registry.gdi-de.org/id/de.bund.bkg.regschluessel/${page.getRegionKey().getKey()}">${page.getRegionKey().getValue()}</gmx:Anchor>
                                    </gmd:code>
                                </gmd:MD_Identifier>
                            </gmd:geographicIdentifier>
                        </gmd:EX_GeographicDescription>
                    </gmd:geographicElement>
                @endif
                @if(page.getResourceDateType() != null)
                    <gmd:temporalElement>
                        <gmd:EX_TemporalExtent>
                            <gmd:extent>
                                @if("at".equals(page.getResourceDateType()))
                                    <gml:TimeInstant gml:id="timePeriod_ID_${TransformationTools.getRandomUUID()}">
                                        <gml:timePosition>${page.getData().getTemporal().getResourceDate()}</gml:timePosition>
                                    </gml:TimeInstant>
                                @else
                                    <gml:TimePeriod gml:id="timePeriod_ID_${TransformationTools.getRandomUUID()}">
                                            <gml:beginPosition ${page.getResourceBeginIndeterminatePosition()}>${page.getResourceBeginDate()}</gml:beginPosition>
                                            <gml:endPosition ${page.getResourceEndIndeterminatePosition()}>${page.getResourceEndDate()}</gml:endPosition>
                                    </gml:TimePeriod>
                                @endif
                            </gmd:extent>
                        </gmd:EX_TemporalExtent>
                    </gmd:temporalElement>
                @endif
            </gmd:EX_Extent>
        </gmd:extent>

        @for(String language : page.getDataLanguages())
            <gmd:language>
                <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/" codeListValue="${language}" />
            </gmd:language>
        @endfor
    </gmd:MD_DataIdentification>
</gmd:identificationInfo>

