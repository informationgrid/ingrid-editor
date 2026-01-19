@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid_nlpv.exporter.transformer.PublicationTransformerNlpv
@import java.util.Map
@param Map<String, Object> map

!{var page = ((PublicationTransformerNlpv)map.get("model"));}


@template.export.ingrid.idf.idf-publication(map = map, extraContent = @`
    @if(  TransformationTools.hasValue(page.getMetadataMaintenanceAndUpdateFrequency()) || TransformationTools.hasValue(page.getMetadataMaintenanceNote()) )
        <gmd:metadataMaintenance>
            <gmd:MD_MaintenanceInformation>
                @if(  TransformationTools.hasValue(page.getMetadataMaintenanceAndUpdateFrequency()) )
                    <gmd:maintenanceAndUpdateFrequency>
                        <gmd:MD_MaintenanceFrequencyCode
                                codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_MaintenanceFrequencyCode"
                                codeListValue="${page.getMetadataMaintenanceAndUpdateFrequency()}" />
                    </gmd:maintenanceAndUpdateFrequency>
                @else
                    <gmd:maintenanceAndUpdateFrequency gco:nilReason="missing" />
                @endif
                @if(  TransformationTools.hasValue(page.getMetadataUserDefinedMaintenanceFrequency()))
                    <gmd:userDefinedMaintenanceFrequency>
                        <gts:TM_PeriodDuration>${page.getMetadataUserDefinedMaintenanceFrequency()}</gts:TM_PeriodDuration>
                    </gmd:userDefinedMaintenanceFrequency>
                @endif
                <gmd:updateScope>
                    <gmd:MD_ScopeCode
                            codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode"
                            codeListValue="${page.getHierarchyLevel()}" />
                </gmd:updateScope>
                @if(TransformationTools.hasValue(page.getMetadataMaintenanceNote()))
                    <gmd:maintenanceNote>
                        <gco:CharacterString>${page.getMetadataMaintenanceNote()}</gco:CharacterString>
                    </gmd:maintenanceNote>
                @endif
            </gmd:MD_MaintenanceInformation>
        </gmd:metadataMaintenance>
    @endif
`
)
