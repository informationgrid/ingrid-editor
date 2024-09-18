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
package de.ingrid.igeserver.exports.ingrid_bkg

const val USE_CONSTRAINTS_OTHER = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                        </gmd:MD_LegalConstraints>
"""
const val USE_CONSTRAINTS_COPYRIGHT = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="copyright"/>
                            </gmd:useConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                        </gmd:MD_LegalConstraints>
"""
const val USE_CONSTRAINTS_INTELLECTIONALPROPERTYRIGHTS = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="intellectualPropertyRights"/>
                            </gmd:useConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                        </gmd:MD_LegalConstraints>
"""
const val USE_CONSTRAINTS_RESTRICTED = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="restricted"/>
                            </gmd:useConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val USE_CONSTRAINTS_RESTRICTED_WITH_COMMENT_SOURCE = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="restricted"/>
                            </gmd:useConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>bkg use comment</gco:CharacterString>
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Quellenvermerk: bkg use source</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS = """???"""
