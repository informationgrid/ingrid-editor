@import de.ingrid.igeserver.profiles.uvp.exporter.model.ApprovalProcedureModel
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPNumber

@param ApprovalProcedureModel page

<?xml version="1.0" encoding="UTF-8"?>
<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:idfMdMetadata>
            @template.uvp.shared-general(page = page)
            <spatialValue>Deutschland, Niedersachsen, Grasberg: 8.9606, 53.1763, 8.9677, 53.1796</spatialValue>
            <uvpgs>@for(UVPNumber uvpNumber : page.getUvpNumbers())
                <uvpg category="${uvpNumber.getCategory()}" type="${uvpNumber.getType()}">${uvpNumber.getUvpg()}</uvpg>
            @endfor</uvpgs>
            <addresses>
                !{var address = page.getPointOfContact();}
                <address id="${address.getUuid()}" type="">
                    <name>${address.getNamePresentation()}</name>
                    <phone>${address.getTelephone()}</phone>
                    <fax>${address.getFax()}</fax>
                    <street>${address.getAddress().getStreet()}</street>
                    <city>${address.getAddress().getCity()}</city>
                    <postalcode>${address.getAddress().getPoBox()}</postalcode>
                    <country>${page.getCodelistValue("6200", address.getAddress().getCountry())}</country>
                    <mail>${address.getEmail()}</mail>
                    <url>${address.getHomepage()}</url>
                    <parent id="${address.getParent()}">
                        <name>-parentName-</name>
                    </parent>
                </address>
            </addresses>
            @template.uvp.shared-steps(page = page)
        </idf:idfMdMetadata>
    </idf:body>
</idf:html>


<%--

<?xml version="1.0" encoding="UTF-8"?>
<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:idfMdMetadata>
            <id>C3B43C6F-C3D6-4F79-8351-C263CFA6860F</id>
            <parent_id>24E96A08-7A9B-471E-828C-6D775BB58EB9</parent_id>
            <date>2021-10-27</date>
            <name>B 3 Südschnellweg Hannover</name>
            <descr>Der Südschnellweg zwischen Landwehrkreisel und Seelhorster Kreuz ist Teil des ringförmigen Fernstraßennetzes, das die Innenstadt von Hannover umgibt. Als Hauptverkehrsachse im Süden Hannovers, über die drei Bundesstraßen gebündelt verlaufen (B 3, B 6 und B 65), ist er von sehr hoher Bedeutung. Die heutigen Gesamtfahrbahnbreiten betragen bei vier Fahrstreifen auf dem westlichen Damm 14,5 m und auf den Brücken von der Leineflutmulde bis zur Schützenallee 13,50 m und auf der Brücke über die Hildesheimer Straße 12,50 m. Diese entsprechen damit nicht mehr den aktuellen Regelwerken. Außerdem verfügt der Südschnellweg im Projektbereich über keinen Seitenstreifen sowie zu schmale Fahrstreifen und keinen ausreichenden Mittelstreifen. Aus diesen Gründen ist ein vollständiger Ausbau des Südschnellwegs erforderlich. Außerdem weisen drei von neun Brücken des Südschnellwegs inzwischen so hohe Tragfähigkeitsdefizite auf, dass ihre Nutzungsdauer trotz Verstärkungsmaßnahmen im Jahr 2023 bzw. 2024 erschöpft sein wird. Die Brücke über die Schützenallee weist aufgrund von Spannungsrisskorrosion kein ausreichendes Ankündigungsverhalten auf. Daher sind für diese Brücken vier Ersatzneubauten erforderlich, wobei die Brücke über die Hildesheimer Straße durch einen Tunnel ersetzt wird.</descr>
            <type>10</type>
            <spatialValue>Deutschland, Niedersachsen, Hannover: 9.7126, 52.3244, 9.7874, 52.3534</spatialValue>
            <uvpgs>
                <uvpg category="UVPG-14" type="A">UVPG-14.6</uvpg>
            </uvpgs>
            <addresses>
                <address id="08235526-818A-425D-831D-495654A95FEE" type="1">
                    <name>Team 63.01: Baurecht und Fachaufsicht</name>
                    <phone>+49(0)511 / 616 -  2 2603</phone>
                    <fax>+49(0)511 / 616 – 1 123480</fax>
                    <street>Hildesheimer Straße 20</street>
                    <city>Hannover</city>
                    <postalcode>30169</postalcode>
                    <country>Deutschland</country>
                    <mail>63.01.Planfeststellung@region-hannover.de</mail>
                    <parent id="33919983-660F-4275-ABB8-92C74D82DECD">
                        <name>Region Hannover, Niedersachsen</name>
                    </parent>
                </address>
            </addresses>
            <steps>
                <step type="phase1">
                    <datePeriod>
                        <from>2020-03-06T00:00:00.000+01:00</from>
                        <to>2020-04-06T00:00:00.000+02:00</to>
                    </datePeriod>
                    <docs type="technicalDocs">
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/Bekanntmachung%20vom%2028.02.2020%20Hannover.pdf</link>
                            <label>Bekanntmachung vom 28.02.2020 Hannover</label>
                        </doc>
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/Bekanntmachung%20vom%2004.03.2020%20Hemmingen.pdf</link>
                            <label>Bekanntmachung vom 04.03.2020 Hemmingen</label>
                        </doc>
                    </docs>
                    <docs type="applicationDocs">
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/U1%20Anlage%20A-Bewertungsmatrix%20RQ%2031.pdf</link>
                            <label>U1 Anlage A-Bewertungsmatrix RQ 31</label>
                        </doc>
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/U1%20Anlage%20B-Bewertungsmatrix%20Ostportal.pdf</link>
                            <label>U1 Anlage B-Bewertungsmatrix Ostportal</label>
                        </doc>
                    </docs>
                    <docs type="reportsRecommendationsDocs">
                        <doc>
                            <label>U17.1.1 Bericht Schalltechnische Untersuchung</label>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/U17.1.1%20Bericht%20Schalltechnische%20Untersuchung.pdf</link>
                        </doc>
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/U17.1.2%20Berechnungsunterlagen%20Schallschutz.pdf</link>
                            <label>U17.1.2 Berechnungsunterlagen Schallschutz</label>
                        </doc>
                    </docs>
                    <docs type="moreDocs">
                        <doc>
                            <label>U18.1 Anlage 1.1 Erläuterungsbericht OE</label>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/U18.1%20Anlage%201.1%20Erl%C3%A4uterungsbericht%20OE.pdf</link>
                        </doc>
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/U18.1%20Anlage%201.2%20Erl%C3%A4uterungsbericht%20OE.pdf</link>
                            <label>U18.1 Anlage 1.2 Erläuterungsbericht OE</label>
                        </doc>
                    </docs>
                </step>
                <step type="phase2">
                    <datePeriod>
                        <from>2020-10-26T00:00:00.000+01:00</from>
                        <to>2020-10-30T00:00:00.000+01:00</to>
                    </datePeriod>
                    <docs type="considerationDocs">
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/MUST14%20Bekanntmachungstext.pdf</link>
                            <label>MUST14 Bekanntmachungstext</label>
                        </doc>
                        <doc>
                            <label>210308 B3 SSW Deckblattunterlage/210308 B3 SSW Deckblattunterlage/Hinweise zu den Vorbemerkungen der Deckblattunterlage</label>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/210308%20B3%20SSW%20Deckblattunterlage/210308%20B3%20SSW%20Deckblattunterlage/Hinweise%20zu%20den%20Vorbemerkungen%20der%20Deckblattunterlage.pdf</link>
                        </doc>
                    </docs>
                </step>
                <step type="phase3">
                    <date>
                        <from>2021-09-22T00:00:00.000+02:00</from>
                    </date>
                    <docs type="approvalDocs">
                        <doc>
                            <label>1. Öffentliche Bekanntmachung Region Hannover</label>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/1.%20%C3%96ffentliche%20Bekanntmachung%20Region%20Hannover.pdf</link>
                        </doc>
                        <doc>
                            <label>2. Ortsübliche Bekanntmachung Hannover</label>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/2.%20Orts%C3%BCbliche%20Bekanntmachung%20Hannover.pdf</link>
                        </doc>
                        <doc>
                            <label>3. Ortsübliche Bekanntmachung Hemmingen</label>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/3.%20Orts%C3%BCbliche%20Bekanntmachung%20Hemmingen.pdf</link>
                        </doc>
                    </docs>
                    <docs type="designDocs">
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/4.%20Beschluss%20B3%20SSW%20Hannover.pdf</link>
                            <label>4. Beschluss B3 SSW Hannover</label>
                        </doc>
                        <doc>
                            <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/C3B43C6F-C3D6-4F79-8351-C263CFA6860F/Inhaltsverzeichnis.pdf</link>
                            <label>Inhaltsverzeichnis</label>
                        </doc>
                    </docs>
                </step>
            </steps>
            <docs type="uvpNegativeRelevantDocs"/>
        </idf:idfMdMetadata>
    </idf:body>
</idf:html>

--%>