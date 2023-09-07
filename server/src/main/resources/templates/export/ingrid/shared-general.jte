@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.exporter.model.CharacterStringModel
@import de.ingrid.igeserver.exporter.model.SpatialModel;
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.OperatesOn
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer.UseConstraintTemplate
@import de.ingrid.igeserver.profiles.ingrid.exporter.BrowseGraphic
@import de.ingrid.igeserver.profiles.ingrid.exporter.DisplayOperation
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.*
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.Reference
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.DateEvent
@import gg.jte.Content

@param IngridModelTransformer page
@param Content contentInfo = null

!{var spatial = page.getData().getSpatial();}
!{var verticalExtent = spatial.getVerticalExtent();}

<gmd:fileIdentifier>
    <gco:CharacterString>${page.getModel().getUuid()}</gco:CharacterString>
</gmd:fileIdentifier>

@if(page.getRegionKey() != null)
<idf:regionKey>
    <key>${page.getRegionKey().getValue()}</key>
    <url>https://registry.gdi-de.org/id/de.bund.bkg.regschluessel/${page.getRegionKey().getKey()}</url>
</idf:regionKey>
@endif

<gmd:language>
    <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/" codeListValue="${page.getMetadataLanguage()}" />
</gmd:language>
<gmd:characterSet>
    <gmd:MD_CharacterSetCode
            codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_CharacterSetCode"
            codeListValue="${page.getMetadataCharacterSet()}" />
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
    !{var address = page.getContact();}
    @if(address != null)
        <idf:idfResponsibleParty type="${address.getAddressDocType()}" uuid="${address.getUuid()}">
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
                    @if(address.getHoursOfService() != null)
                    <gmd:hoursOfService>
                        <gco:CharacterString>${address.getHoursOfService()}</gco:CharacterString>
                    </gmd:hoursOfService>
                    @endif
                </gmd:CI_Contact>
            </gmd:contactInfo>
            <gmd:role>
                <gmd:CI_RoleCode
                        codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                        codeListValue="pointOfContact"/>
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


@if(page.getGridSpatialRepresentation() != null)
<gmd:spatialRepresentationInfo>
    <gmd:MD_GridSpatialRepresentation>
        <gmd:numberOfDimensions>
            <gco:Integer>${page.getGridSpatialRepresentation().getNumberOfDimensions()}</gco:Integer>
        </gmd:numberOfDimensions>
        @for(AxisDimensionProperties axisDimensionProperties : page.getGridSpatialRepresentation().getAxesDimensionProperties())
            <gmd:axisDimensionProperties>
                <gmd:MD_Dimension>
                    <gmd:dimensionName>
                        <gmd:MD_DimensionNameTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_GeometricObjectTypeCode" codeListValue="${page.getCodelists().getValue("514", axisDimensionProperties.getName(), "iso")}"/>
                    </gmd:dimensionName>
                    <gmd:dimensionSize>
                        <gco:Integer>${axisDimensionProperties.getSize()}</gco:Integer>
                    </gmd:dimensionSize>
                    @if(axisDimensionProperties.getResolution() != null)
                    <gmd:resolution>
                        <gco:Scale uom="meter">${axisDimensionProperties.getResolution()}</gco:Scale>
                    </gmd:resolution>
                    @endif
                </gmd:MD_Dimension>
            </gmd:axisDimensionProperties>
        @endfor
        <gmd:cellGeometry>
            <gmd:MD_CellGeometryCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_GeometricObjectTypeCode" codeListValue="${page.getCellGeometry()}"/>
        </gmd:cellGeometry>
        <gmd:transformationParameterAvailability>
            <gco:Boolean>true</gco:Boolean>
        </gmd:transformationParameterAvailability>
    </gmd:MD_GridSpatialRepresentation>
</gmd:spatialRepresentationInfo>
@endif




@for(CharacterStringModel spatialSystem : page.getSpatialSystems())
    <gmd:referenceSystemInfo>
        <gmd:MD_ReferenceSystem>
            <gmd:referenceSystemIdentifier>
                <gmd:RS_Identifier>
                        <gmd:code>
                            @template.ingrid.anchorOrCharacterString(model = spatialSystem)
                        </gmd:code>
                </gmd:RS_Identifier>
            </gmd:referenceSystemIdentifier>
        </gmd:MD_ReferenceSystem>
    </gmd:referenceSystemInfo>
@endfor

<gmd:identificationInfo>
    <${page.getIdentificationType()} uuid="${page.getCitationURL()}">
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
                                        codeListValue="${page.getCodelists().getValue("502", event.getReferenceDateType(), "iso")}" />
                            </gmd:dateType>
                        </gmd:CI_Date>
                    </gmd:date>
                    @endfor
                @endif
                @if( page.getModel().getType().equals("InGridGeoDataset") )
                <gmd:identifier>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>${page.getCitationURL()}</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:identifier>
                @endif
            </gmd:CI_Citation>
        </gmd:citation>
        <gmd:abstract>
            <gco:CharacterString>${page.getDescription()}</gco:CharacterString>
        </gmd:abstract>
        @if( page.getPurpose() != null )
        <gmd:purpose>
            <gco:CharacterString>${page.getPurpose()}</gco:CharacterString>
        </gmd:purpose>
        @endif
        @if( page.getStatus() != null )
        <gmd:status>
            <gmd:MD_ProgressCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ProgressCode" codeListValue="${page.getStatus()}"/>
        </gmd:status>
        @endif
        @template.ingrid.pointOfContact(addresses = page.getPointOfContact())

        @if( page.getMaintenanceAndUpdateFrequency() != null)
        <gmd:resourceMaintenance>
            <gmd:MD_MaintenanceInformation>
                <gmd:maintenanceAndUpdateFrequency>
                    <gmd:MD_MaintenanceFrequencyCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_MaintenanceFrequencyCode" codeListValue="${page.getMaintenanceAndUpdateFrequency()}"/>
                </gmd:maintenanceAndUpdateFrequency>
                @if( page.getUserDefinedMaintenanceFrequency() != null)
                <gmd:userDefinedMaintenanceFrequency>
                    <gts:TM_PeriodDuration>${page.getUserDefinedMaintenanceFrequency()}</gts:TM_PeriodDuration>
                </gmd:userDefinedMaintenanceFrequency>
                @endif
                <gmd:updateScope>
                    <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="${page.getHierarchyLevel()}"/>
                </gmd:updateScope>
                @if( page.getMaintenanceNote() != null)
                <gmd:maintenanceNote>
                    <gco:CharacterString>${page.getMaintenanceNote()}</gco:CharacterString>
                </gmd:maintenanceNote>
                @endif
            </gmd:MD_MaintenanceInformation>
        </gmd:resourceMaintenance>
        @endif
        @for( BrowseGraphic browseGraphic : page.getBrowseGraphics())
        <gmd:graphicOverview>
            <gmd:MD_BrowseGraphic>
                <gmd:fileName>
                    <gco:CharacterString>${browseGraphic.getUri()}</gco:CharacterString>
                </gmd:fileName>
                @if( browseGraphic.getDescription() != null)
                <gmd:fileDescription>
                    <gco:CharacterString>${browseGraphic.getDescription()}</gco:CharacterString>
                </gmd:fileDescription>
                @endif
            </gmd:MD_BrowseGraphic>
        </gmd:graphicOverview>
        @endfor



        @template.ingrid.descriptiveKeywords(thesaurus = page.getInspireKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getServiceTypeKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getFreeKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getInspirePriorityKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getSpatialScopeKeyword())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getOpendataCategoryKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getAdvCompatibleKeyword())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getInspireRelevantKeyword())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getFurtherLegalBasisKeywords())
        @template.ingrid.descriptiveKeywords(thesaurus = page.getUmthesKeywords())

        @if(TransformationTools.hasValue(page.getSpecificUsage()))
        <gmd:resourceSpecificUsage>
            <gmd:MD_Usage>
                <gmd:specificUsage>
                    <gco:CharacterString>${page.getSpecificUsage()}</gco:CharacterString>
                </gmd:specificUsage>
                <gmd:userContactInfo gco:nilReason="unknown"/>
            </gmd:MD_Usage>
        </gmd:resourceSpecificUsage>
        @endif
        @if( TransformationTools.hasValue(page.getUseLimitation()))
            <gmd:resourceConstraints>
                <gmd:MD_LegalConstraints>
                    <gmd:useLimitation>
                        <gco:CharacterString>${page.getUseLimitation()}</gco:CharacterString>
                    </gmd:useLimitation>
                </gmd:MD_LegalConstraints>
            </gmd:resourceConstraints>
        @endif
        @if(TransformationTools.hasValue(page.getUseConstraints()))
        <gmd:resourceConstraints>
            <gmd:MD_LegalConstraints>
                <gmd:useConstraints>
                    <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                </gmd:useConstraints>
                @for(UseConstraintTemplate useconstraint : page.getUseConstraints() )
                    <gmd:otherConstraints>
                        @template.ingrid.anchorOrCharacterString(model = useconstraint.getTitle())
                    </gmd:otherConstraints>
                    @if(TransformationTools.hasValue(useconstraint.getSource()))
                        <gmd:otherConstraints>
                            <gco:CharacterString>Quellenvermerk: ${useconstraint.getSource()}</gco:CharacterString>
                        </gmd:otherConstraints>
                    @endif
                    @if(TransformationTools.hasValue(useconstraint.getJson()))
                        <gmd:otherConstraints>
                            <gco:CharacterString>${useconstraint.getJson()}</gco:CharacterString>
                        </gmd:otherConstraints>
                    @endif
                @endfor
            </gmd:MD_LegalConstraints>
        </gmd:resourceConstraints>
        @endif
        @if(TransformationTools.hasValue( page.getAvailabilityAccessConstraints()))
        <gmd:resourceConstraints>
            <gmd:MD_LegalConstraints>
                <gmd:accessConstraints>
                    <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                </gmd:accessConstraints>
                @for(CharacterStringModel accessConstraint : page.getAvailabilityAccessConstraints() )
                <gmd:otherConstraints>
                    @template.ingrid.anchorOrCharacterString(model = accessConstraint)
                </gmd:otherConstraints>
                @endfor
            </gmd:MD_LegalConstraints>
        </gmd:resourceConstraints>
        @endif

        @for(String spatialRepresentationType : page.getSpatialRepresentationTypes())
            <gmd:spatialRepresentationType>
                <gmd:MD_SpatialRepresentationTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_SpatialRepresentationTypeCode" codeListValue="${spatialRepresentationType}"/>
            </gmd:spatialRepresentationType>
        @endfor

        @for(Resolution resolution : page.getSpatialResolution())
            @if(resolution.getDenominator() != null)
                <gmd:spatialResolution>
                    <gmd:MD_Resolution>
                        <gmd:equivalentScale>
                            <gmd:MD_RepresentativeFraction>
                                <gmd:denominator>
                                    <gco:Integer>${resolution.getDenominator()}</gco:Integer>
                                </gmd:denominator>
                            </gmd:MD_RepresentativeFraction>
                        </gmd:equivalentScale>
                    </gmd:MD_Resolution>
                </gmd:spatialResolution>
            @endif
            @if(resolution.getDistanceMeter() != null)
                <gmd:spatialResolution>
                    <gmd:MD_Resolution>
                        <gmd:distance>
                            <gco:Distance uom="meter">${resolution.getDistanceMeter()}</gco:Distance>
                        </gmd:distance>
                    </gmd:MD_Resolution>
                </gmd:spatialResolution>
            @endif
            @if(resolution.getDistanceDPI() != null)
                <gmd:spatialResolution>
                    <gmd:MD_Resolution>
                        <gmd:distance>
                            <gco:Distance uom="dpi">${resolution.getDistanceDPI()}</gco:Distance>
                        </gmd:distance>
                    </gmd:MD_Resolution>
                </gmd:spatialResolution>
            @endif
        @endfor
        @for(String language : page.getDataLanguages())
            <gmd:language>
                <gmd:LanguageCode codeList="http://www.loc.gov/standards/iso639-2/" codeListValue="${language}" />
            </gmd:language>
        @endfor
        @if(page.getDatasetCharacterSet() != null)
            <gmd:characterSet>
                <gmd:MD_CharacterSetCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_CharacterSetCode" codeListValue="${page.getDatasetCharacterSet()}"/>
            </gmd:characterSet>
        @endif
        @for(String category : page.getTopicCategories())
            <gmd:topicCategory>
                <gmd:MD_TopicCategoryCode>${category}</gmd:MD_TopicCategoryCode>
            </gmd:topicCategory>
        @endfor
        @if(page.getServiceType() != null)
            <srv:serviceType>
                <gco:LocalName>${page.getServiceType()}</gco:LocalName>
            </srv:serviceType>
        @endif
        @for(String version : page.getServiceTypeVersions())
            <srv:serviceTypeVersion>
                <gco:CharacterString>${version}</gco:CharacterString>
            </srv:serviceTypeVersion>
        @endfor
        <${page.getExtentType()}>
            <gmd:EX_Extent>
                @if(spatial.getDescription() != null)
                    <gmd:description>
                        <gco:CharacterString>${spatial.getDescription()}</gco:CharacterString>
                    </gmd:description>
                @endif
                @for(SpatialModel ref : page.getSpatialReferences())
                    @if(ref.getType().equals("free") || ref.getType().equals("wfsgnde"))
                        @if(ref.getTitle() != null)
                            <gmd:geographicElement>
                                <gmd:EX_GeographicDescription>
                                    <gmd:extentTypeCode>
                                        <gco:Boolean>true</gco:Boolean>
                                    </gmd:extentTypeCode>
                                    <gmd:geographicIdentifier>
                                        <gmd:MD_Identifier>
                                            <gmd:code>
                                                <gco:CharacterString>${ref.getTitleWithArs()}</gco:CharacterString>
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
                                    $unsafe{ref.getWktCoordinatesISO()}
                                </gmd:polygon>
                            </gmd:EX_BoundingPolygon>
                        </gmd:geographicElement>
                    @endif
                    @if(TransformationTools.hasValue(ref.getArs()))
                        <gmd:geographicElement>
                            <gmd:EX_GeographicDescription>
                                <gmd:geographicIdentifier>
                                    <gmd:MD_Identifier>
                                        <gmd:code>
                                            <gmx:Anchor xlink:href="https://registry.gdi-de.org/id/de.bund.bkg.regschluessel/${ref.getArs()}">${ref.getArs()}</gmx:Anchor>
                                        </gmd:code>
                                    </gmd:MD_Identifier>
                                </gmd:geographicIdentifier>
                            </gmd:EX_GeographicDescription>
                        </gmd:geographicElement>
                    @endif
                @endfor
                @if(page.getResourceDateType() != null)
                    <gmd:temporalElement>
                        <gmd:EX_TemporalExtent>
                            <gmd:extent>
                                @if("at".equals(page.getResourceDateType()))
                                    <gml:TimeInstant gml:id="timePeriod_ID_${TransformationTools.getRandomUUID()}">
                                        <gml:timePosition>${page.formatDate(page.getFormatterISO(), page.getData().getTemporal().getResourceDate())}</gml:timePosition>
                                    </gml:TimeInstant>
                                @else
                                    <gml:TimePeriod gml:id="timePeriod_ID_${TransformationTools.getRandomUUID()}">
                                        <gml:beginPosition $unsafe{page.getResourceBeginIndeterminatePosition()}>${page.getResourceBeginDate() != null ? page.formatDate(page.getFormatterISO(), page.getResourceBeginDate()) : ""}</gml:beginPosition>
                                        <gml:endPosition $unsafe{page.getResourceEndIndeterminatePosition()}>${page.getResourceEndDate() != null ? page.formatDate(page.getFormatterISO(), page.getResourceEndDate()) : ""}</gml:endPosition>
                                    </gml:TimePeriod>
                                @endif
                            </gmd:extent>
                        </gmd:EX_TemporalExtent>
                    </gmd:temporalElement>
                @endif
                @if(page.hasCompleteVerticalExtent())
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
                                                <gml:CoordinateSystemAxis gml:id="coordinateSystemAxis_ID_${TransformationTools.getRandomUUID()}" uom="${ page.getCodelists().getValue("102", verticalExtent.getUnitOfMeasure(), "iso")}">
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
                                            <gml:name>${page.getCodelists().getValue("101", verticalExtent.getDatum(), "en")}</gml:name>
                                            <gml:scope/>
                                        </gml:VerticalDatum>
                                    </gml:verticalDatum>
                                </gml:VerticalCRS>
                            </gmd:verticalCRS>
                        </gmd:EX_VerticalExtent>
                    </gmd:verticalElement>
                @endif
            </gmd:EX_Extent>
        </${page.getExtentType()}>
    @for( DisplayOperation operation : page.getOperations() )
        <srv:coupledResource>
            <srv:SV_CoupledResource>
                <srv:operationName>
                    <gco:CharacterString>${operation.getName()}</gco:CharacterString>
                </srv:operationName>
                <srv:identifier>
                    <gco:CharacterString>${operation.getIdentifierLink()}</gco:CharacterString>
                </srv:identifier>
            </srv:SV_CoupledResource>
        </srv:coupledResource>
    @endfor
    @if(TransformationTools.hasValue(page.getCouplingType()))
        <srv:couplingType>
            <srv:SV_CouplingType codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#SV_CouplingType" codeListValue="${page.getCouplingType()}"/>
        </srv:couplingType>
    @endif
    @if(page.isAtomDownload())
        <srv:containsOperations>
            <srv:SV_OperationMetadata>
                <srv:operationName>
                    <gco:CharacterString>Download</gco:CharacterString>
                </srv:operationName>
                <srv:connectPoint>
                    <gmd:CI_OnlineResource>
                        <gmd:linkage>
                            <gmd:URL>${page.getAtomDownloadURL()}</gmd:URL>
                        </gmd:linkage>
                    </gmd:CI_OnlineResource>
                </srv:connectPoint>
            </srv:SV_OperationMetadata>
        </srv:containsOperations>
    @endif
    @if( page.getOperations().isEmpty() && page.getData().getService() != null )
        <srv:containsOperations gco:nilReason="missing"/>
    @endif
    @for( DisplayOperation operation : page.getOperations() )
        <srv:containsOperations>
            <srv:SV_OperationMetadata>
                <srv:operationName>
                    <gco:CharacterString>${operation.getName()}</gco:CharacterString>
                </srv:operationName>
                @if(TransformationTools.hasValue(operation.getDescription()))
                <srv:operationDescription>
                    <gco:CharacterString>${operation.getDescription()}</gco:CharacterString>
                </srv:operationDescription>
                @endif
                @if(TransformationTools.hasValue(operation.getMethodCall()))
                <srv:connectPoint>
                    <gmd:CI_OnlineResource>
                        <gmd:linkage>
                            <gmd:URL>${operation.getMethodCall()}</gmd:URL>
                        </gmd:linkage>
                    </gmd:CI_OnlineResource>
                </srv:connectPoint>
                @endif
            </srv:SV_OperationMetadata>
        </srv:containsOperations>
    @endfor
    @for( OperatesOn operatesOn : page.getOperatesOn() )
        <srv:operatesOn uuidref="${operatesOn.getUuidref()}" xlink:href="${operatesOn.getHref()}"/>
    @endfor
</${page.getIdentificationType()}>
</gmd:identificationInfo>

${contentInfo}

@if(page.hasDistributionInfo())
<gmd:distributionInfo>
    <gmd:MD_Distribution>
        @for( DistributionFormat distributionFormat : page.getDistributionFormats() )
                <gmd:distributionFormat>
                    <gmd:MD_Format>
                        @if(distributionFormat.getName() != null)
                        <gmd:name>
                            <gco:CharacterString>${page.getCodelists().getValue("1320",distributionFormat.getName())}</gco:CharacterString>
                        </gmd:name>
                        @endif
                        @if(TransformationTools.hasValue(distributionFormat.getVersion()))
                        <gmd:version>
                            <gco:CharacterString>${distributionFormat.getVersion()}</gco:CharacterString>
                        </gmd:version>
                        @endif
                        @if(TransformationTools.hasValue(distributionFormat.getSpecification()))
                        <gmd:specification>
                            <gco:CharacterString>${distributionFormat.getSpecification()}</gco:CharacterString>
                        </gmd:specification>
                        @endif
                        @if(TransformationTools.hasValue(distributionFormat.getCompression()))
                        <gmd:fileDecompressionTechnique>
                            <gco:CharacterString>${distributionFormat.getCompression()}</gco:CharacterString>
                        </gmd:fileDecompressionTechnique>
                        @endif
                    </gmd:MD_Format>
                </gmd:distributionFormat>
        @endfor
        @if (page.getDistributionFormats().isEmpty())
            <%--  always write format, here with nilReason children, see INGRID32-146--%>
            <%--  NOW ALSO when distributor exists (was missing) !, see INGRID-2277--%>
            <gmd:distributionFormat>
                <gmd:MD_Format>
                    <gmd:name gco:nilReason="unknown" />
                    <gmd:version gco:nilReason="unknown" />
                </gmd:MD_Format>
            </gmd:distributionFormat>
        @endif
        @if(page.getData().getOrderInfo() != null)
        <gmd:distributor>
            <gmd:MD_Distributor>
                <gmd:distributorContact>
                    <gmd:CI_ResponsibleParty>
                        <gmd:role>
                            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="distributor"/>
                        </gmd:role>
                    </gmd:CI_ResponsibleParty>
                </gmd:distributorContact>
                <gmd:distributionOrderProcess>
                    <gmd:MD_StandardOrderProcess>
                        <gmd:orderingInstructions>
                            <gco:CharacterString>${page.getData().getOrderInfo()}</gco:CharacterString>
                        </gmd:orderingInstructions>
                    </gmd:MD_StandardOrderProcess>
                </gmd:distributionOrderProcess>
            </gmd:MD_Distributor>
        </gmd:distributor>
        @endif
        @for( Reference reference : page.getReferences() )
            <gmd:transferOptions>
                <gmd:MD_DigitalTransferOptions>
                    <gmd:onLine>
                        <idf:idfOnlineResource>
                            <gmd:linkage>
                                <gmd:URL>${reference.getUrl()}</gmd:URL>
                            </gmd:linkage>
                            <gmd:name>
                                <gco:CharacterString>${reference.getTitle()}</gco:CharacterString>
                            </gmd:name>
                            @if(reference.getExplanation() != null)
                            <gmd:description>
                                <gco:CharacterString>${reference.getExplanation()}</gco:CharacterString>
                            </gmd:description>
                            @endif
                            <gmd:function>
                                <gmd:CI_OnLineFunctionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_OnLineFunctionCode" codeListValue="${page.getCodelists().getValue("2000", reference.getType(), "iso")}">${page.getCodelists().getValue("2000", reference.getType(), "iso")}</gmd:CI_OnLineFunctionCode>
                            </gmd:function>
                            <idf:attachedToField entry-id="${reference.getType().getKey()}" list-id="2000">${page.getCodelists().getValue("2000", reference.getType())}</idf:attachedToField>
                        </idf:idfOnlineResource>
                    </gmd:onLine>
                </gmd:MD_DigitalTransferOptions>
            </gmd:transferOptions>
        @endfor
        @for( ServiceUrl serviceUrl : page.getServiceUrls() )
            <gmd:transferOptions>
                <gmd:MD_DigitalTransferOptions>
                    <gmd:onLine>
                        <gmd:CI_OnlineResource>
                            <gmd:linkage>
                                <gmd:URL>${serviceUrl.getUrl()}</gmd:URL>
                            </gmd:linkage>
                            <gmd:name>
                                <gco:CharacterString>${serviceUrl.getName()}</gco:CharacterString>
                            </gmd:name>
                            @if(serviceUrl.getDescription() != null)
                            <gmd:description>
                                <gco:CharacterString>${serviceUrl.getDescription()}</gco:CharacterString>
                            </gmd:description>
                            @endif
                            <gmd:function>
                                <gmd:CI_OnLineFunctionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_OnLineFunctionCode" codeListValue="information">information</gmd:CI_OnLineFunctionCode>
                            </gmd:function>
                        </gmd:CI_OnlineResource>
                    </gmd:onLine>
                </gmd:MD_DigitalTransferOptions>
            </gmd:transferOptions>
        @endfor
        @if(page.isAtomDownload())
            <gmd:transferOptions>
                <gmd:MD_DigitalTransferOptions>
                    <gmd:onLine>
                        <gmd:CI_OnlineResource>
                            <gmd:linkage>
                                <gmd:URL>${page.getAtomDownloadURL()}</gmd:URL>
                            </gmd:linkage>
                            <gmd:name>
                                <gco:CharacterString>Get Download Service Metadata</gco:CharacterString>
                            </gmd:name>
                            <gmd:function>
                                <gmd:CI_OnLineFunctionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_OnLineFunctionCode" codeListValue="information">information</gmd:CI_OnLineFunctionCode>
                            </gmd:function>
                        </gmd:CI_OnlineResource>
                    </gmd:onLine>
                </gmd:MD_DigitalTransferOptions>
            </gmd:transferOptions>
        @endif
        @for( DigitalTransferOption digitalTransferOption : page.getDigitalTransferOptions() )
            <gmd:transferOptions>
                <gmd:MD_DigitalTransferOptions>
                    <gmd:transferSize>
                        <gco:Real>${digitalTransferOption.getTransferSize()}</gco:Real>
                    </gmd:transferSize>
                    <gmd:offLine>
                        <gmd:MD_Medium>
                            <gmd:name>
                                <gmd:MD_MediumNameCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_MediumNameCode" codeListValue="${page.getCodelists().getValue("520",digitalTransferOption.getName(),"iso")}"/>
                            </gmd:name>
                            <gmd:mediumNote>
                                <gco:CharacterString>${digitalTransferOption.getMediumNote()}</gco:CharacterString>
                            </gmd:mediumNote>
                        </gmd:MD_Medium>
                    </gmd:offLine>
                </gmd:MD_DigitalTransferOptions>
            </gmd:transferOptions>
        @endfor
    </gmd:MD_Distribution>
</gmd:distributionInfo>
@endif

