@import de.ingrid.igeserver.profiles.uvp.exporter.model.ApprovalProcedureModel
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPNumber

@param ApprovalProcedureModel page

<?xml version="1.0" encoding="UTF-8"?>
<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:idfMdMetadata>
            <id>${page.getUuid()}</id>
            @if(page.getParentUuid() != null)
                <parent_id>${page.getParentUuid()}</parent_id>
            @endif
            <date>${page.getModified()}</date>
            <name>${page.getTitle()}</name>
            <descr>${page.getDescription()}</descr>
            <type>${page.getDocumentType()}</type>
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
            <steps/>
            <datePeriod type="uvpNegativeApprovalDate">
                <from>2020-03-12T00:00:00.000+01:00</from>
            </datePeriod>
            <docs type="uvpNegativeRelevantDocs">
                <doc>
                    <link>https://uvp.niedersachsen.de/documents/ingrid-group_ige-iplug-ni/F476F436-98DA-4612-8463-41F3EB1CC788/Entscheidung%20Gerken.docx</link>
                    <label>Entscheidung Gerken</label>
                </doc>
            </docs>
        </idf:idfMdMetadata>
    </idf:body>
</idf:html>