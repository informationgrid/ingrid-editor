/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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

const val idfSuperiorReferences = """
            <idf:superiorReference uuid="1000">
                <idf:objectName>Test-Datensatz Minimal</idf:objectName>
                <idf:objectType>1</idf:objectType>
                <idf:description>Feld von Beschreibung</idf:description>
            </idf:superiorReference>
"""

const val idfSubordinatedReferences = """
            <idf:subordinatedReference uuid="1000">
                <idf:objectName>Test-Datensatz Minimal</idf:objectName>
                <idf:objectType>1</idf:objectType>
                <idf:description>Feld von Beschreibung</idf:description>
            </idf:subordinatedReference>
"""

const val idfReferences = """
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