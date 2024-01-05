@import de.ingrid.igeserver.exporter.AddressModelTransformer
@import de.ingrid.igeserver.exporter.ObjectReference
@import de.ingrid.igeserver.exporter.SubordinatedParty
@import de.ingrid.igeserver.exporter.TransformationTools
@import java.util.List

@param List<AddressModelTransformer> addresses
@param Boolean isAddressExport = false

@for(AddressModelTransformer address : addresses)
    @if(!isAddressExport)
        <gmd:pointOfContact>
        <idf:idfResponsibleParty type="${address.getAddressDocType()}" uuid="${address.getUuid()}">
    @endif
    @if(address.getIndividualName() != null )
        <gmd:individualName>
            <gco:CharacterString>${address.getIndividualName()}</gco:CharacterString>
        </gmd:individualName>
    @endif
    @if(address.getOrganization() != null)
        <gmd:organisationName>
            <gco:CharacterString>${address.getOrganization()}</gco:CharacterString>
        </gmd:organisationName>
    @endif
    @if(TransformationTools.hasValue(address.getPositionName()))
        <gmd:positionName>
            <gco:CharacterString>${address.getPositionName()}</gco:CharacterString>
        </gmd:positionName>
    @endif
    <gmd:contactInfo>
        <gmd:CI_Contact>
            @if( address.getTelephone() != null || address.getFax() != null )
                <gmd:phone>
                    <gmd:CI_Telephone>
                        @if(address.getTelephone() != null)
                            <gmd:voice>
                                <gco:CharacterString>${address.getTelephone()}</gco:CharacterString>
                            </gmd:voice>
                        @endif
                        @if(address.getFax() != null)
                            <gmd:facsimile>
                                <gco:CharacterString>${address.getFax()}</gco:CharacterString>
                            </gmd:facsimile>
                        @endif
                    </gmd:CI_Telephone>
                </gmd:phone>
            @endif
            <gmd:address>
                <gmd:CI_Address>
                    @if(!address.getPostBoxAddress().isEmpty())
                        <gmd:deliveryPoint>
                            <gco:CharacterString>${address.getPostBoxAddress()}</gco:CharacterString>
                        </gmd:deliveryPoint>
                    @endif
                    @if(TransformationTools.hasValue(address.getStreet()))
                        <gmd:deliveryPoint>
                            <gco:CharacterString>${address.getStreet()}</gco:CharacterString>
                        </gmd:deliveryPoint>
                    @endif
                    @if(TransformationTools.hasValue(address.getCity()))
                        <gmd:city>
                            <gco:CharacterString>${address.getCity()}</gco:CharacterString>
                        </gmd:city>
                    @endif
                    @if(TransformationTools.hasValue(address.getAdministrativeArea()))
                        <gmd:administrativeArea>
                            <gco:CharacterString>${address.getAdministrativeArea()}</gco:CharacterString>
                        </gmd:administrativeArea>
                    @endif
                    @if(TransformationTools.hasValue(address.getZipCode()))
                        <gmd:postalCode>
                            <gco:CharacterString>${address.getZipCode()}</gco:CharacterString>
                        </gmd:postalCode>
                    @endif
                    @if(TransformationTools.hasValue(address.getCountry()))
                        <gmd:country>
                            <gco:CharacterString>${address.getCountry()}</gco:CharacterString>
                        </gmd:country>
                    @endif
                    @if(TransformationTools.hasValue(address.getModel().getEmail()))
                        <gmd:electronicMailAddress>
                            <gco:CharacterString>${address.getModel().getEmail()}</gco:CharacterString>
                        </gmd:electronicMailAddress>
                    @endif
                </gmd:CI_Address>
            </gmd:address>
            @if(TransformationTools.hasValue(address.getHomepage()))
                <gmd:onlineResource>
                    <gmd:CI_OnlineResource>
                        <gmd:linkage>
                            <gmd:URL>${address.getHomepage()}</gmd:URL>
                        </gmd:linkage>
                    </gmd:CI_OnlineResource>
                </gmd:onlineResource>
            @endif
            @if(TransformationTools.hasValue(address.getHoursOfService()))
                <gmd:hoursOfService>
                    <gco:CharacterString>${address.getHoursOfService()}</gco:CharacterString>
                </gmd:hoursOfService>
            @endif
        </gmd:CI_Contact>
    </gmd:contactInfo>
    @if(address.getType() != null)
        <gmd:role>
            <gmd:CI_RoleCode
                    codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                    codeListValue="${address.getCodelist().getValue("505", address.getType(), "iso")}" />
        </gmd:role>
    @else
        <gmd:role gco:nilReason="inapplicable" />
    @endif
    @if(isAddressExport)
        <idf:last-modified>
            <gco:DateTime>${address.getLastModified()}</gco:DateTime>
        </idf:last-modified>
    @endif
    @for( AddressModelTransformer adr : address.getHierarchy())
        <idf:hierarchyParty uuid="${adr.getModel().getUuid()}">
            @if(adr.getIndividualName(false) != null )
                <idf:addressIndividualName>${adr.getIndividualName(false)}</idf:addressIndividualName>
            @endif
            @if(adr.getModel().getOrganization() != null)
                <idf:addressOrganisationName>${adr.getModel().getOrganization()}</idf:addressOrganisationName>
            @endif
            <idf:addressType>${adr.getAddressDocType()}</idf:addressType>
        </idf:hierarchyParty>
    @endfor
    @if(isAddressExport)
        @for( SubordinatedParty subordinatedParty : address.getSubordinatedParties())
            <idf:subordinatedParty uuid="${subordinatedParty.getUuid()}">
                @if(TransformationTools.hasValue(subordinatedParty.getIndividualName()))
                    <idf:addressIndividualName>${subordinatedParty.getIndividualName()}</idf:addressIndividualName>
                @endif
                @if(TransformationTools.hasValue(subordinatedParty.getOrganisationName()))
                    <idf:addressOrganisationName>${subordinatedParty.getOrganisationName()}</idf:addressOrganisationName>
                @endif
                <idf:addressType>${subordinatedParty.getType()}</idf:addressType>
            </idf:subordinatedParty>
        @endfor
        @for( ObjectReference object : address.getObjectReferences())
            <idf:objectReference uuid="${object.getUuid()}">
                <idf:objectName>${object.getName()}</idf:objectName>
                <idf:objectType>${object.getType()}</idf:objectType>
                @if(TransformationTools.hasValue(object.getDescription()))
                    <idf:description>${object.getDescription()}</idf:description>
                @endif
                @if(TransformationTools.hasValue(object.getGraphicOverview()))
                    <idf:graphicOverview>${object.getGraphicOverview()}</idf:graphicOverview>
                @endif
            </idf:objectReference>
        @endfor
    @endif
    @if(!isAddressExport)
        </idf:idfResponsibleParty>
        </gmd:pointOfContact>
    @endif
@endfor
