@import de.ingrid.igeserver.profiles.uvp.exporter.model.ApprovalProcedureModel
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPNumber

@param ApprovalProcedureModel page

<?xml version="1.0" encoding="UTF-8"?>
<idf:html xmlns:idf="http://www.portalu.de/IDF/1.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xsi:schemaLocation="http://www.portalu.de/IDF/1.0 ingrid_detail_data_schema.xsd">
    <idf:head/>
    <idf:body>
        <idf:idfMdMetadata>
            @template.uvp.shared-general(page = page)
            <spatialValue>${page.getSpatial()}</spatialValue>
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
