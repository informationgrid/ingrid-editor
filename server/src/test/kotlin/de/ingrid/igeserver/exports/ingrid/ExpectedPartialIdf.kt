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