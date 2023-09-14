@import de.ingrid.igeserver.exporter.AddressModelTransformer
@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.exporter.model.AddressModel
@import java.util.List

@param List<AddressModelTransformer> addresses

@for(AddressModelTransformer address : addresses)
        <gmd:pointOfContact>
            <idf:idfResponsibleParty type="${address.getAddressDocType()}" uuid="${address.getUuid()}">
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
                                @if(address.getStreet() != null)
                                    <gmd:deliveryPoint>
                                        <gco:CharacterString>${address.getStreet()}</gco:CharacterString>
                                    </gmd:deliveryPoint>
                                @endif
                                @if(address.getCity() != null)
                                    <gmd:city>
                                        <gco:CharacterString>${address.getCity()}</gco:CharacterString>
                                    </gmd:city>
                                @endif
                                @if(address.getAdministrativeArea() != null)
                                    <gmd:administrativeArea>
                                        <gco:CharacterString>${address.getAdministrativeArea()}</gco:CharacterString>
                                    </gmd:administrativeArea>
                                @endif
                                @if(address.getZipCode() != null)
                                    <gmd:postalCode>
                                        <gco:CharacterString>${address.getZipCode()}</gco:CharacterString>
                                    </gmd:postalCode>
                                @endif
                                @if(address.getCountry() != null)
                                    <gmd:country>
                                        <gco:CharacterString>${address.getCountry()}</gco:CharacterString>
                                    </gmd:country>
                                @endif
                                @if(address.getModel().getEmail() != null)
                                    <gmd:electronicMailAddress>
                                        <gco:CharacterString>${address.getModel().getEmail()}</gco:CharacterString>
                                    </gmd:electronicMailAddress>
                                @endif
                            </gmd:CI_Address>
                        </gmd:address>
                        @if(address.getHomepage() != null)
                            <gmd:onlineResource>
                                <gmd:CI_OnlineResource>
                                    <gmd:linkage>
                                        <gmd:URL>${address.getHomepage()}</gmd:URL>
                                    </gmd:linkage>
                                </gmd:CI_OnlineResource>
                            </gmd:onlineResource>
                        @endif
                        @if(address.getHoursOfService() != null)
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
                <gmd:role gco:nilReason="inapplicable"/>
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
            </idf:idfResponsibleParty>
        </gmd:pointOfContact>
@endfor
