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
            @if(address.getModel().getOrganization() != null)
                <gmd:organisationName>
                    <gco:CharacterString>${address.getModel().getOrganization()}</gco:CharacterString>
                </gmd:organisationName>
                <gmd:positionName>
                    <gco:CharacterString>Notizen MMMM</gco:CharacterString>
                </gmd:positionName>
            @endif
            <gmd:contactInfo>
                <gmd:CI_Contact>
                    <gmd:address>
                        <gmd:CI_Address>
                            <gmd:administrativeArea>
                                <gco:CharacterString>${address.getAdministrativeArea()}</gco:CharacterString>
                            </gmd:administrativeArea>
<%--                            <gmd:deliveryPoint>
                                <gco:CharacterString>${address.deliveryPoint}</gco:CharacterString>
                            </gmd:deliveryPoint>
                            <gmd:city>
                                <gco:CharacterString>${address.city}</gco:CharacterString>
                            </gmd:city>
                            <gmd:administrativeArea>
                                <gco:CharacterString>${address.administrativeArea}</gco:CharacterString>
                            </gmd:administrativeArea>
                            <gmd:postalCode>
                                <gco:CharacterString>${address.postalCode}</gco:CharacterString>
                            </gmd:postalCode>--%>
                            <gmd:country>
                                <gco:CharacterString>${address.getCountry()}</gco:CharacterString>
                            </gmd:country>
                            <gmd:electronicMailAddress>
                                <gco:CharacterString>${address.getModel().getEmail()}</gco:CharacterString>
                            </gmd:electronicMailAddress>
                        </gmd:CI_Address>
                    </gmd:address>
                </gmd:CI_Contact>
            </gmd:contactInfo>
            <gmd:role>
                <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="pointOfContact"/>
            </gmd:role>
            <idf:hierarchyParty uuid="${address.getModel().getUuid()}">
                @if(address.getIndividualName() != null )<idf:addressIndividualName>${address.getIndividualName()}</idf:addressIndividualName>@endif
                <idf:addressType>${address.getType().getKey()}</idf:addressType>
            </idf:hierarchyParty>
        </idf:idfResponsibleParty>
    </gmd:pointOfContact>
@endif
@endfor

<%--

<gmd:pointOfContact>
    <idf:idfResponsibleParty type="3" uuid="8049B933-10D6-478D-BBFA-F9340F886B6D">
        <gmd:individualName>
            <gco:CharacterString>admin, admin, Frau Dr.</gco:CharacterString>
        </gmd:individualName>
        <gmd:positionName>
            <gco:CharacterString>Administrator of this catalog.</gco:CharacterString>
        </gmd:positionName>
        <gmd:contactInfo>
            <gmd:CI_Contact>
                <gmd:address>
                    <gmd:CI_Address>
                        <gmd:electronicMailAddress>
                            <gco:CharacterString>test@test.test</gco:CharacterString>
                        </gmd:electronicMailAddress>
                    </gmd:CI_Address>
                </gmd:address>
            </gmd:CI_Contact>
        </gmd:contactInfo>
        <gmd:role>
            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="pointOfContact"/>
        </gmd:role>
        <idf:hierarchyParty uuid="8049B933-10D6-478D-BBFA-F9340F886B6D">
            <idf:addressIndividualName>admin, admin, Frau Dr.</idf:addressIndividualName>
            <idf:addressType>3</idf:addressType>
        </idf:hierarchyParty>
    </idf:idfResponsibleParty>
</gmd:pointOfContact>
<gmd:pointOfContact>
    <idf:idfResponsibleParty type="0" uuid="3C456CA7-4F84-4C90-B8A2-7AC305B9C046">
        <gmd:organisationName>
            <gco:CharacterString>Adresstitel Umbenennung Test</gco:CharacterString>
        </gmd:organisationName>
        <gmd:contactInfo>
            <gmd:CI_Contact>
                <gmd:address>
                    <gmd:CI_Address>
                        <gmd:country>
                            <gco:CharacterString>DEU</gco:CharacterString>
                        </gmd:country>
                        <gmd:electronicMailAddress>
                            <gco:CharacterString>kst@portalu.de</gco:CharacterString>
                        </gmd:electronicMailAddress>
                    </gmd:CI_Address>
                </gmd:address>
            </gmd:CI_Contact>
        </gmd:contactInfo>
        <gmd:role>
            <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="processor"/>
        </gmd:role>
        <idf:hierarchyParty uuid="3C456CA7-4F84-4C90-B8A2-7AC305B9C046">
            <idf:addressOrganisationName>Adresstitel Umbenennung Test</idf:addressOrganisationName>
            <idf:addressType>0</idf:addressType>
        </idf:hierarchyParty>
    </idf:idfResponsibleParty>
</gmd:pointOfContact>
--%>
