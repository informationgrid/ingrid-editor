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
package de.ingrid.igeserver.exports.ingrid_lubw

const val oacKeyword = """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>oac: test_oac</gco:CharacterString>
                            </gmd:keyword>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
"""

const val systemEnvironment = """
                    <gmd:environmentDescription>
                        <gco:CharacterString>test_environmentDescription</gco:CharacterString>
                    </gmd:environmentDescription>
"""