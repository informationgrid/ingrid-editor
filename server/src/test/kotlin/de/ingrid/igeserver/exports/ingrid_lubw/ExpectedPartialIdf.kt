/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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

const val OAC_KEYWORD = """
                    <gmd:descriptiveKeywords>
                        <gmd:MD_Keywords>
                            <gmd:keyword>
                                <gco:CharacterString>oac: test_oac</gco:CharacterString>
                            </gmd:keyword>
                        </gmd:MD_Keywords>
                    </gmd:descriptiveKeywords>
"""

const val SYSTEM_ENVIRONMENT = """
                    <gmd:environmentDescription>
                        <gco:CharacterString>test_environmentDescription</gco:CharacterString>
                    </gmd:environmentDescription>
"""

const val OBJECT_ATTRIBUTES = """
            <idf:objectAttribute>
                <idf:group>Berichte</idf:group>
                <idf:designation>Test 2</idf:designation>
                <idf:description>Beschreibung Zwei</idf:description>
                <idf:category>Pflichtdaten Test</idf:category>
                <idf:transmissionLevel>1 - unbeschränkt (im Internet)</idf:transmissionLevel>
            </idf:objectAttribute>
            <idf:objectAttribute>
                <idf:group>Bewertung</idf:group>
                <idf:designation>Open 1</idf:designation>
                <idf:description>Beschreibung 3</idf:description>
                <idf:category>Angebotsdaten</idf:category>
                <idf:transmissionLevel>0 - Open Data</idf:transmissionLevel>
            </idf:objectAttribute>
"""
