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
package de.ingrid.igeserver.exports.ingrid_lfubayern

const val DATASET_URI = """
            <gmd:dataSetURI>
                <gco:CharacterString>https://my-dataseturi.com</gco:CharacterString>
            </gmd:dataSetURI>
"""

const val SUPPLEMENTAL_INFORMATION = """
                    <gmd:supplementalInformation>
                        <gco:CharacterString>internal comments</gco:CharacterString>
                    </gmd:supplementalInformation>
"""

const val INTERNAL_KEYWORDS = """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>intern eins</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:keyword>
                                <gco:CharacterString>intern zwei</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="theme"/>
                            </gmd:type>
                            <gmd:thesaurusName>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>LfU Bayern Internal Keywords</gco:CharacterString>
                                    </gmd:title>
                                    <gmd:date>
                                        <gmd:CI_Date>
                                            <gmd:date>
                                                <gco:Date>2024-07-01</gco:Date>
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

const val GEOLOGICAL_KEYWORDS = """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>geological eins</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:keyword>
                                <gco:CharacterString>geological zwei</gco:CharacterString>
                            </gmd:keyword>
                            <gmd:type>
                                <gmd:MD_KeywordTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_KeywordTypeCode" codeListValue="stratum"/>
                            </gmd:type>
                            <gmd:thesaurusName>
                                <gmd:CI_Citation>
                                    <gmd:title>
                                        <gco:CharacterString>LfU Bayern Geological Keywords</gco:CharacterString>
                                    </gmd:title>
                                    <gmd:date>
                                        <gmd:CI_Date>
                                            <gmd:date>
                                                <gco:Date>2018-08-01</gco:Date>
                                            </gmd:date>
                                            <gmd:dateType>
                                                <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="revision">revision</gmd:CI_DateTypeCode>
                                            </gmd:dateType>
                                        </gmd:CI_Date>
                                    </gmd:date>
                                </gmd:CI_Citation>
                            </gmd:thesaurusName>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
"""

const val FEES = """
                            <gmd:distributionOrderProcess>
                                <gmd:MD_StandardOrderProcess>
                                    <gmd:fees>
                                        <gco:CharacterString>It is free!</gco:CharacterString>
                                    </gmd:fees>
"""

const val USE_CONSTRAINT_COMMENTS = """
                            <gmd:otherConstraints>
                                <gco:CharacterString>my comments to use constraints</gco:CharacterString>
                            </gmd:otherConstraints>
"""

const val USE_CONSTRAINT_COMMENTS_FULL = """
                    <gmd:resourceConstraints>
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Andere Freeware Lizenz; Datenquelle: meine Quelle; my comments to use constraints</gco:CharacterString>
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>{"id":"other-freeware","name":"Andere Freeware Lizenz","url":"","quelle":"Datenquelle: meine Quelle"}</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
                    </gmd:resourceConstraints>
"""
