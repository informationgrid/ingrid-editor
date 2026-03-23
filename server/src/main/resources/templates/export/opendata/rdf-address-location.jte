@import de.ingrid.igeserver.exporter.AddressModelTransformer

@param AddressModelTransformer address
<locn:address>
    <locn:Address>
        @if (address.hasAddress())
            <locn:fullAddress>${address.getFullAddress()}</locn:fullAddress>@endif
        @if (address.getCity() != null)
            <locn:postName>${address.getCity()}</locn:postName>@endif
        @if (address.getZipCode() != null)
            <locn:postCode>${address.getZipCode()}</locn:postCode>@endif
        @if (address.getPoBox() != null)
            <locn:poBox>${address.getPoBox()}</locn:poBox>@endif
        @if (address.getCountryIso3166() != null)
            <locn:adminUnitL1>${address.getCountryIso3166()}</locn:adminUnitL1>@endif
        @if (address.getAdministrativeArea() != null)
            <locn:adminUnitL2>${address.getAdministrativeArea()}</locn:adminUnitL2>@endif
    </locn:Address>
</locn:address>
