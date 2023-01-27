@import de.ingrid.igeserver.exporter.model.SpatialModel
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
@import java.util.List
@import java.util.Map

@param List<SpatialModel> spatials

<gmd:extent>
    <gmd:EX_Extent>
        <gmd:description>
            <gco:CharacterString>testerl</gco:CharacterString>
        </gmd:description>
        <gmd:geographicElement>
            <gmd:EX_GeographicDescription>
                <gmd:extentTypeCode>
                    <gco:Boolean>true</gco:Boolean>
                </gmd:extentTypeCode>
                <gmd:geographicIdentifier>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>Niedersachsen</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:geographicIdentifier>
            </gmd:EX_GeographicDescription>
        </gmd:geographicElement>
        <gmd:geographicElement>
            <gmd:EX_GeographicBoundingBox>
                <gmd:extentTypeCode>
                    <gco:Boolean>true</gco:Boolean>
                </gmd:extentTypeCode>
                <gmd:westBoundLongitude>
                    <gco:Decimal>6.489729</gco:Decimal>
                </gmd:westBoundLongitude>
                <gmd:eastBoundLongitude>
                    <gco:Decimal>11.665435</gco:Decimal>
                </gmd:eastBoundLongitude>
                <gmd:southBoundLatitude>
                    <gco:Decimal>51.270607</gco:Decimal>
                </gmd:southBoundLatitude>
                <gmd:northBoundLatitude>
                    <gco:Decimal>54.118393</gco:Decimal>
                </gmd:northBoundLatitude>
            </gmd:EX_GeographicBoundingBox>
        </gmd:geographicElement>
        <gmd:geographicElement>
            <gmd:EX_GeographicDescription>
                <gmd:extentTypeCode>
                    <gco:Boolean>true</gco:Boolean>
                </gmd:extentTypeCode>
                <gmd:geographicIdentifier>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>Harz</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:geographicIdentifier>
            </gmd:EX_GeographicDescription>
        </gmd:geographicElement>
        <gmd:geographicElement>
            <gmd:EX_GeographicBoundingBox>
                <gmd:extentTypeCode>
                    <gco:Boolean>true</gco:Boolean>
                </gmd:extentTypeCode>
                <gmd:westBoundLongitude>
                    <gco:Decimal>9.605</gco:Decimal>
                </gmd:westBoundLongitude>
                <gmd:eastBoundLongitude>
                    <gco:Decimal>9.918</gco:Decimal>
                </gmd:eastBoundLongitude>
                <gmd:southBoundLatitude>
                    <gco:Decimal>52.304</gco:Decimal>
                </gmd:southBoundLatitude>
                <gmd:northBoundLatitude>
                    <gco:Decimal>52.454</gco:Decimal>
                </gmd:northBoundLatitude>
            </gmd:EX_GeographicBoundingBox>
        </gmd:geographicElement>
        <gmd:geographicElement>
            <gmd:EX_GeographicDescription>
                <gmd:extentTypeCode>
                    <gco:Boolean>true</gco:Boolean>
                </gmd:extentTypeCode>
                <gmd:geographicIdentifier>
                    <gmd:MD_Identifier>
                        <gmd:code>
                            <gco:CharacterString>Frankeneck</gco:CharacterString>
                        </gmd:code>
                    </gmd:MD_Identifier>
                </gmd:geographicIdentifier>
            </gmd:EX_GeographicDescription>
        </gmd:geographicElement>
        <gmd:geographicElement>
            <gmd:EX_GeographicBoundingBox>
                <gmd:extentTypeCode>
                    <gco:Boolean>true</gco:Boolean>
                </gmd:extentTypeCode>
                <gmd:westBoundLongitude>
                    <gco:Decimal>7.985285</gco:Decimal>
                </gmd:westBoundLongitude>
                <gmd:eastBoundLongitude>
                    <gco:Decimal>8.05378</gco:Decimal>
                </gmd:eastBoundLongitude>
                <gmd:southBoundLatitude>
                    <gco:Decimal>49.367386</gco:Decimal>
                </gmd:southBoundLatitude>
                <gmd:northBoundLatitude>
                    <gco:Decimal>49.393562</gco:Decimal>
                </gmd:northBoundLatitude>
            </gmd:EX_GeographicBoundingBox>
        </gmd:geographicElement>
        <gmd:verticalElement>
            <gmd:EX_VerticalExtent>
                <gmd:minimumValue>
                    <gco:Real>12.0</gco:Real>
                </gmd:minimumValue>
                <gmd:maximumValue>
                    <gco:Real>121212.0</gco:Real>
                </gmd:maximumValue>
                <gmd:verticalCRS>
                    <gml:VerticalCRS gml:id="verticalCRSN_ID_ae7b8cf6-a711-4a30-9e71-b041f17da9d3">
                        <gml:identifier codeSpace=""/>
                        <gml:scope/>
                        <gml:verticalCS>
                            <gml:VerticalCS gml:id="verticalCS_ID_61426ce0-155f-40ad-b6a9-2a7743c98cbc">
                                <gml:identifier codeSpace=""/>
                                <gml:axis>
                                    <gml:CoordinateSystemAxis gml:id="coordinateSystemAxis_ID_d1988fbc-d4a8-48d4-9156-003837d93a8c" uom="Foot">
                                        <gml:identifier codeSpace=""/>
                                        <gml:axisAbbrev/>
                                        <gml:axisDirection codeSpace=""/>
                                    </gml:CoordinateSystemAxis>
                                </gml:axis>
                            </gml:VerticalCS>
                        </gml:verticalCS>
                        <gml:verticalDatum>
                            <gml:VerticalDatum gml:id="verticalDatum_ID_a25a4044-25c2-4484-9584-36f6d0b6b33c">
                                <gml:identifier codeSpace=""/>
                                <gml:name>Baltic Sea</gml:name>
                                <gml:scope/>
                            </gml:VerticalDatum>
                        </gml:verticalDatum>
                    </gml:VerticalCRS>
                </gmd:verticalCRS>
            </gmd:EX_VerticalExtent>
        </gmd:verticalElement>
    </gmd:EX_Extent>
</gmd:extent>
<gmd:extent>
    <gmd:EX_Extent>
        <gmd:geographicElement>
            <gmd:EX_BoundingPolygon>
                <gmd:extentTypeCode>
                    <gco:Boolean>true</gco:Boolean>
                </gmd:extentTypeCode>
                <gmd:polygon>
                    <gml:Point gml:id="Point_ID_77eb1db6-56f3-4231-821c-8db1cc12261f" srsDimension="2">
                        <gml:pos>10 10</gml:pos>
                    </gml:Point>
                </gmd:polygon>
            </gmd:EX_BoundingPolygon>
        </gmd:geographicElement>
    </gmd:EX_Extent>
</gmd:extent>
