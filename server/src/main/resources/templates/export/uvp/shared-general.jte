@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel

@param UVPModel page

<id>${page.getUuid()}</id>
@if(page.getParentUuid() != null)
    <parent_id>${page.getParentUuid()}</parent_id>
@endif
<date>${page.formatDate(page.getFormatterOnlyDate(), page.get_contentModified())}</date>
<name>${page.getTitle()}</name>
<descr>${page.getData().getDescription()}</descr>
<type>${page.getDocumentType()}</type>
<spatialValue>${page.getSpatial()}</spatialValue>
<addresses>
    !{var address = page.getPointOfContact();}
    @if(address != null)
        <address id="${address.getUuid()}" type="7">
            <name>${address.getOrganization() != null ? address.getOrganization(): address.getLastName() + ", " + address.getFirstName()}</name>
            <phone>${address.getTelephone()}</phone>
            <fax>${address.getFax()}</fax>
            <street>${address.getLocation().getStreet()}</street>
            <city>${address.getLocation().getCity()}</city>
            <postalcode>${address.getLocation().getZipCode()}</postalcode>
            @if (page.hasPoBox())
            <postbox>${page.getPostBoxString()}</postbox>
            @endif
            <country>${page.getCodelistValue("6200", address.getLocation().getCountry())}</country>
            <mail>${address.getEmail()}</mail>
            <url>${address.getHomepage()}</url>
            @for(var parent : page.getUvpAddressParents())
                <parent id="${page.getAddressShort(parent.getDocument()).getUuid()}">
                    <name>${page.getAddressShort(parent.getDocument()).getTitle()}</name>
                </parent>
            @endfor
        </address>
    @endif
</addresses>
