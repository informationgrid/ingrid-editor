/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.exports.ingrid

const val IDF_SUPERIOR_REFERENCES = """
            <idf:superiorReference uuid="1000">
                <idf:objectName>Test-Datensatz Minimal</idf:objectName>
                <idf:objectType>1</idf:objectType>
                <idf:description>Feld von Beschreibung</idf:description>
            </idf:superiorReference>
"""

const val IDF_SUBORDINATED_REFERENCES = """
            <idf:subordinatedReference uuid="1000">
                <idf:objectName>Test-Datensatz Minimal</idf:objectName>
                <idf:objectType>1</idf:objectType>
                <idf:description>Feld von Beschreibung</idf:description>
            </idf:subordinatedReference>
"""

const val IDF_REFERENCES = """
                    <gmd:transferOptions>
                        <gmd:MD_DigitalTransferOptions>
                            <gmd:onLine>
                                <idf:idfOnlineResource>
                                    <gmd:linkage>
                                        <gmd:URL>https://wemove.com</gmd:URL>
                                    </gmd:linkage>
                                    <gmd:applicationProfile>
                                        <gco:CharacterString>my-type</gco:CharacterString>
                                    </gmd:applicationProfile>
                                    <gmd:name>
                                        <gco:CharacterString>test-title</gco:CharacterString>
                                    </gmd:name>
                                    <gmd:description>
                                        <gco:CharacterString>test-explanation</gco:CharacterString>
                                    </gmd:description>
                                    <gmd:function>
                                        <gmd:CI_OnLineFunctionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_OnLineFunctionCode" codeListValue="download">download</gmd:CI_OnLineFunctionCode>
                                    </gmd:function>
                                    <idf:attachedToField entry-id="9990" list-id="2000">Datendownload</idf:attachedToField>
                                </idf:idfOnlineResource>
                            </gmd:onLine>
                        </gmd:MD_DigitalTransferOptions>
                    </gmd:transferOptions>
"""

const val ADDRESS_HIERARCHY = """
            <idf:hierarchyParty uuid="25d56d6c-ed8d-4589-8c14-f8cfcb669115">
                <idf:addressOrganisationName>Wemove Test</idf:addressOrganisationName>
                <idf:addressType>0</idf:addressType>
            </idf:hierarchyParty>
            <idf:hierarchyParty uuid="7d754425-0200-49f0-8f85-84785021ba98">
                <idf:addressOrganisationName>Sub-Organization</idf:addressOrganisationName>
                <idf:addressType>0</idf:addressType>
            </idf:hierarchyParty>
            <idf:hierarchyParty uuid="bf4c615b-cd7c-4fd9-a306-1dfb2fbcf6d2">
                <idf:addressIndividualName>PersonSubOrga, Max, Herr Dr.</idf:addressIndividualName>
                <idf:addressType>2</idf:addressType>
            </idf:hierarchyParty>
"""

const val ADDRESS_HIERARCHY_WITH_POSITION_NAME_SET = """
            <gmd:individualName>
                <gco:CharacterString>PersonSubOrga, Max, Herr Dr.</gco:CharacterString>
            </gmd:individualName>
            <gmd:organisationName>
                <gco:CharacterString>Wemove Test</gco:CharacterString>
            </gmd:organisationName>
            <gmd:positionName>
                <gco:CharacterString>Position/nachgeordnete Abteilung</gco:CharacterString>
            </gmd:positionName>
"""

const val ADDRESS_HIERARCHY_WITH_NO_POSITION_NAME_SET = """
            <gmd:individualName>
                <gco:CharacterString>PersonSubOrga, Max, Herr Dr.</gco:CharacterString>
            </gmd:individualName>
            <gmd:organisationName>
                <gco:CharacterString>Wemove Test</gco:CharacterString>
            </gmd:organisationName>
            <gmd:positionName>
                <gco:CharacterString>Sub-Organization</gco:CharacterString>
            </gmd:positionName>
"""

const val USE_LIMITATION_CONSTRAINTS = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useLimitation>
                                <gco:CharacterString>bkg useLimitation constraint</gco:CharacterString>
                            </gmd:useLimitation>
                        </gmd:MD_LegalConstraints>
"""
