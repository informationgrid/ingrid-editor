@import de.ingrid.igeserver.exporter.AddressModelTransformer
@import de.ingrid.igeserver.exporter.model.AddressModel
@import de.ingrid.igeserver.exporter.model.AddressRefModel
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import java.util.List
@import java.util.Map

@param List<AddressModelTransformer> addresses

@for(AddressModelTransformer address : addresses)
    @if( address.getType() != null)
        <gmd:pointOfContact>
            <idf:idfResponsibleParty type="${address.getType().getKey()}" uuid="${address.getModel().getUuid()}">
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
                @if(address.getPositionName() != null)
                    <gmd:positionName>
                        <gco:CharacterString>${address.getPositionName()}</gco:CharacterString>
                    </gmd:positionName>
                @endif
                <gmd:contactInfo>
                    <gmd:CI_Contact>
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
                    </gmd:CI_Contact>
                </gmd:contactInfo>
                <gmd:role>
                    <gmd:CI_RoleCode
                            codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode"
                            codeListValue="resourceProvider"/>
                </gmd:role>
                <idf:hierarchyParty uuid="${address.getModel().getUuid()}">
                    @if(address.getIndividualName() != null )
                        <idf:addressIndividualName>${address.getIndividualName()}</idf:addressIndividualName>
                    @endif
                    @if(address.getModel().getOrganization() != null)
                        <idf:addressOrganisationName>${address.getModel().getOrganization()}</idf:addressOrganisationName>
                    @endif
                        <idf:addressType>${address.getAddressDocType()}</idf:addressType>
                </idf:hierarchyParty>
            </idf:idfResponsibleParty>
        </gmd:pointOfContact>
    @endif
@endfor
