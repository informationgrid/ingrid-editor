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
const val USE_CONSTRAINTS_WITH_LONGTEXT = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Wenden Sie sich bitte an das Dienstleistungszentrum (DLZ) des Bundesamt für Kartographie und Geodäsie: https://www.bkg.bund.de/DE/Service/Kontakt/kontakt.html</gco:CharacterString>
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>bkg use comment</gco:CharacterString>
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Quellenvermerk: bkg use source</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""
const val USE_CONSTRAINTS_WITH_LONGTEXT_NO_COMMENT = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Wenden Sie sich bitte an das Dienstleistungszentrum (DLZ) des Bundesamt für Kartographie und Geodäsie: https://www.bkg.bund.de/DE/Service/Kontakt/kontakt.html</gco:CharacterString>
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Quellenvermerk: bkg use source</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val USE_CONSTRAINTS_WITH_LONGTEXT_NO_SOURCE = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Wenden Sie sich bitte an das Dienstleistungszentrum (DLZ) des Bundesamt für Kartographie und Geodäsie: https://www.bkg.bund.de/DE/Service/Kontakt/kontakt.html</gco:CharacterString>
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>bkg use comment</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val USE_CONSTRAINTS_WITH_JUST_LONGTEXT = """
                        <gmd:MD_LegalConstraints>
                            <gmd:useConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions"/>
                            </gmd:useConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Wenden Sie sich bitte an das Dienstleistungszentrum (DLZ) des Bundesamt für Kartographie und Geodäsie: https://www.bkg.bund.de/DE/Service/Kontakt/kontakt.html</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_INSPIRE = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:otherConstraints>
                                <gmx:Anchor xlink:href="http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/INSPIRE_Directive_Article13_1e">Öffentlicher Zugriff beschränkt entsprechend Artikel 13(1)(e) der INSPIRE-Richtlinie: e) aufgrund nachteiliger Auswirkungen auf die Rechte des geistigen Eigentums</gmx:Anchor>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_ONLY_BKG = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>Es gelten Zugriffsbeschränkungen. Für den Erwerb von Nutzungsrechten wenden Sie sich deshalb bitte an die Zentrale Stelle Geotopographie der AdV (ZSGT) / Dienstleistungszentrum (DLZ) des Bundesamtes für Kartographie und Geodäsie: https://www.bkg.bund.de/DE/Service/Kontakt/kontakt.html.</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_TEMPLATE_COPYRIGHT = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="copyright">copyright</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_TEMPLATE_LICENSE = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="license">license</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_TEMPLATE_COPYRIGHTANDLICENSE = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="copyright">copyright</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="license">license</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_TEMPLATE_INTELLECTUALPROPERTYRIGHTS = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="intellectualPropertyRights">intellectualPropertyRights</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_TEMPLATE_RESTRICTED = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="restricted">restricted</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_NO_APPLY = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:otherConstraints>
                                <gmx:Anchor xlink:href="http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/noLimitations">Es gelten keine Zugriffsbeschränkungen</gmx:Anchor>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_AFTER_INSPIRE = """
                    <gmd:resourceConstraints>
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:otherConstraints>
                                <gmx:Anchor xlink:href="http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/INSPIRE_Directive_Article13_1e">Öffentlicher Zugriff beschränkt entsprechend Artikel 13(1)(e) der INSPIRE-Richtlinie: e) aufgrund nachteiliger Auswirkungen auf die Rechte des geistigen Eigentums</gmx:Anchor>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
                    </gmd:resourceConstraints>
                    <gmd:resourceConstraints>
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:otherConstraints>
                                <gmx:Anchor xlink:href="http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/noLimitations">Es gelten keine Zugriffsbeschränkungen</gmx:Anchor>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
                    </gmd:resourceConstraints>
"""

const val ACCESS_CONSTRAINTS_BKG_WITH_COMMENTS = """
                        <gmd:MD_LegalConstraints>
                            <gmd:accessConstraints>
                                <gmd:MD_RestrictionCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_RestrictionCode" codeListValue="otherRestrictions">otherRestrictions</gmd:MD_RestrictionCode>
                            </gmd:accessConstraints>
                            <gmd:otherConstraints>
                                <gmx:Anchor xlink:href="http://inspire.ec.europa.eu/metadata-codelist/LimitationsOnPublicAccess/noLimitations">Es gelten keine Zugriffsbeschränkungen</gmx:Anchor>
                            </gmd:otherConstraints>
                            <gmd:otherConstraints>
                                <gco:CharacterString>access bkg comments</gco:CharacterString>
                            </gmd:otherConstraints>
                        </gmd:MD_LegalConstraints>
"""
