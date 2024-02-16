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
package de.ingrid.igeserver.exports.ingrid_bast

const val projectTitleAndNumberInKeywords = """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>BASt project number</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:keyword>
                                <gco:CharacterString>BASt project title</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:thesaurusName>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>BASt Keywords</gco:CharacterString>
                                    </gmd:title>
                                    <gmd:date>
                                        <gmd:CI_Date>
                                            <gmd:date>
                                                <gco:Date>2024-01-01</gco:Date>
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

const val digitalTransferOptionWithUnit = """
                    <gmd:transferOptions>
                        <gmd:MD_DigitalTransferOptions>
                            <gmd:unitsOfDistribution>
                                <gco:CharacterString>gb</gco:CharacterString>
                            </gmd:unitsOfDistribution>
                            <gmd:transferSize>
                                <gco:Real>123.4</gco:Real>
                            </gmd:transferSize>
                            <gmd:offLine>
                                <gmd:MD_Medium>
                                    <gmd:name>
                                        <gmd:MD_MediumNameCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_MediumNameCode" codeListValue="onLine"/>
                                    </gmd:name>
                                    <gmd:mediumNote>
                                        <gco:CharacterString>Dachboden</gco:CharacterString>
                                    </gmd:mediumNote>
                                </gmd:MD_Medium>
                            </gmd:offLine>
                        </gmd:MD_DigitalTransferOptions>
                    </gmd:transferOptions>
"""

const val supplementalInformation = """
                    <gmd:supplementalInformation>
                        <gco:CharacterString>Bemerkung zur BASt</gco:CharacterString>
                    </gmd:supplementalInformation>
"""

const val useConstraintsComments = """
                            <gmd:otherConstraints>
                                <gco:CharacterString>BASt Nutzungshinweise</gco:CharacterString>
                            </gmd:otherConstraints>
"""