/*
 * ==================================================
 * Copyright (C) 2024-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.exports.ingrid_baw

const val BAW_KEYWORDS = """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>3950005_Schlagwort1</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="discipline"/>
                            </gmd:type>
                            <gmd:thesaurusName>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>BAW-Schlagwortkatalog</gco:CharacterString>
                                    </gmd:title>
                                    <gmd:date>
                                        <gmd:CI_Date>
                                            <gmd:date>
                                                <gco:Date>2012-01-01</gco:Date>
                                            </gmd:date>
                                            <gmd:dateType>
                                                <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="publication">publication</gmd:CI_DateTypeCode>
                                            </gmd:dateType>
                                        </gmd:CI_Date>
                                    </gmd:date>
                                </gmd:CI_Citation>
                            </gmd:thesaurusName>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
"""

const val SUBSOIL_KEYWORDS = """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>3950007_Schlagwort2</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="discipline"/>
                            </gmd:type>
                            <gmd:thesaurusName>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>Baugrunddynamik-Schlagwortkatalog</gco:CharacterString>
                                    </gmd:title>
                                    <gmd:date>
                                        <gmd:CI_Date>
                                            <gmd:date>
                                                <gco:Date>2012-01-01</gco:Date>
                                            </gmd:date>
                                            <gmd:dateType>
                                                <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="publication">publication</gmd:CI_DateTypeCode>
                                            </gmd:dateType>
                                        </gmd:CI_Date>
                                    </gmd:date>
                                </gmd:CI_Citation>
                            </gmd:thesaurusName>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
"""

const val BAW_ORDER_INFO = """
                    <gmd:aggregationInfo>
                        <gmd:MD_AggregateInformation>
                            <gmd:aggregateDataSetName>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>BAW Order Title</gco:CharacterString>
                                    </gmd:title>
                                    <gmd:date gco:nilReason="unknown"/>
                                    <gmd:identifier>
                                        <gmd:MD_Identifier>
                                            <gmd:code>
                                                <gco:CharacterString>12345</gco:CharacterString>
                                            </gmd:code>
                                        </gmd:MD_Identifier>
                                    </gmd:identifier>
                                </gmd:CI_Citation>
                            </gmd:aggregateDataSetName>
                            <gmd:associationType>
                                <gmd:DS_AssociationTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#DS_AssociationTypeCode" codeListValue="largerWorkCitation"/>
                            </gmd:associationType>
                        </gmd:MD_AggregateInformation>
                    </gmd:aggregationInfo>
"""

const val BWASTR_ADDITIONAL_FIELDS = """
            <idf:additionalDataSection id="bawDmqsAdditionalFields">
                <idf:title lang="de">BAW DMQS Zusatzfelder</idf:title>
                <idf:additionalDataField id="bwstr-bwastr_name">
                    <idf:title lang="de">Bwstr Name</idf:title>
                    <idf:data>Test Bwstr</idf:data>
                </idf:additionalDataField>
                <idf:additionalDataField id="bwstr-strecken_name">
                    <idf:title lang="de">Bwstr Streckenname</idf:title>
                    <idf:data>Test Strecke</idf:data>
                </idf:additionalDataField>
            </idf:additionalDataSection>
"""

const val LFS_REFERENCE = """
                            <gmd:onLine>
                                <idf:idfOnlineResource>
                                    <gmd:linkage>
                                        <gmd:URL>https://dl.datenfinder.baw.de/LFS/test-file.pdf</gmd:URL>
                                    </gmd:linkage>
                                    <gmd:name>
                                        <gco:CharacterString>LFS Download</gco:CharacterString>
                                    </gmd:name>
                                    <gmd:description>
                                        <gco:CharacterString>LFS Explanation</gco:CharacterString>
                                    </gmd:description>
                                    <gmd:function>
                                        <gmd:CI_OnLineFunctionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_OnLineFunctionCode" codeListValue="download">download</gmd:CI_OnLineFunctionCode>
                                    </gmd:function>
                                    <idf:attachedToField entry-id="9900" list-id="2000">Datendownload</idf:attachedToField>
                                </idf:idfOnlineResource>
                            </gmd:onLine>
"""
