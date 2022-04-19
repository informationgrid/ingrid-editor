@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel

@param UVPModel page

<id>${page.getUuid()}</id>
@if(page.getParentUuid() != null)
    <parent_id>${page.getParentUuid()}</parent_id>
@endif
<date>${page.getModified()}</date>
<name>${page.getTitle()}</name>
<descr>${page.getData().getDescription()}</descr>
<type>${page.getDocumentType()}</type>
<spatialValue>${page.getSpatial()}</spatialValue>
<addresses>
    !{var address = page.getPointOfContact();}
    <address id="${address.getUuid()}" type="7">
        <name>${address.getNamePresentation()}</name>
        <phone>${address.getTelephone()}</phone>
        <fax>${address.getFax()}</fax>
        <street>${address.getAddress().getStreet()}</street>
        <city>${address.getAddress().getCity()}</city>
        <postalcode>${address.getAddress().getPoBox()}</postalcode>
        <country>${page.getCodelistValue("6200", address.getAddress().getCountry())}</country>
        <mail>${address.getEmail()}</mail>
        <url>${address.getHomepage()}</url>
        @if(address.getParentUuid() != null)
            <parent id="${address.getParentUuid()}">
                <name>${address.getParentName()}</name>
            </parent>
        @endif
    </address>
</addresses>