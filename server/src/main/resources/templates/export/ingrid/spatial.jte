@import de.ingrid.igeserver.exporter.model.SpatialModel
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
@import java.util.List
@import java.util.Map
@import de.ingrid.igeserver.exporter.TransformationTools

@param IngridModel page
!{var spatial = page.getData().getSpatial();}

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
            @if(ref.getFreeCoordinatesISO() != null)
                <gmd:geographicElement>
                    $unsafe{ref.getFreeCoordinatesISO()}
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
    @if(page.getVerticalExtentISO() != null)
    $unsafe{page.getVerticalExtentISO()}
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
                    @elseif("till".equals(page.getResourceDateType()))
                        <gml:TimePeriod gml:id="timePeriod_ID_${TransformationTools.getRandomUUID()}">
                            <gml:beginPosition indeterminatePosition="unknown"></gml:beginPosition>
                            <gml:endPosition>${page.getResourceDate()}</gml:endPosition>
                        </gml:TimePeriod>
                    @elseif("since".equals(page.getResourceDateType()))
                        <gml:TimePeriod gml:id="timePeriod_ID_${TransformationTools.getRandomUUID()}">
                            @if(page.getResourceDateStart() != null)
                                <gml:beginPosition>${page.getResourceDateStart()}</gml:beginPosition>
                            @elseif(page.getResourceDate() != null)
                                <gml:beginPosition>${page.getResourceDate()}</gml:beginPosition>
                            @else
                                <gml:beginPosition indeterminatePosition="unknown"></gml:beginPosition>
                            @endif
                            @if(page.getResourceDateEnd() != null)
                                <gml:endPosition>${page.getResourceDateEnd()}</gml:endPosition>
                            @else
                                <gml:endPosition indeterminatePosition="${"unknown".equals(page.getResourceDateTypeSince()) ? "unknown" : "now"}"></gml:endPosition>
                            @endif
                        </gml:TimePeriod>
                    @endif
                </gmd:extent>
            </gmd:EX_TemporalExtent>
        </gmd:temporalElement>
    @endif
    </gmd:EX_Extent>
</gmd:extent>
