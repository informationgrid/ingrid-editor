@import de.ingrid.igeserver.exporter.AddressModelTransformer

@param AddressModelTransformer address
@param Boolean forceAgent = false
@if (forceAgent || address.isPerson())
    <foaf:Agent>
        <foaf:name>${address.getFirstName()} ${address.getLastName()}</foaf:name>
        @if (address.getHomepage() != null)
        <foaf:homepage rdf:resource="${address.getHomepage()}" />@endif
        @if (!address.getEmails().isEmpty())
        <foaf:mbox rdf:resource="${address.getEmails().get(0)}" />@endif
        <foaf:givenName>${address.getFirstName()}</foaf:givenName>
        <foaf:familyName>${address.getLastName()}</foaf:familyName>
        @if (address.hasAnyAddress())
            @template.export.opendata.rdf-address-location(address = address)
        @endif
    </foaf:Agent>
@else
    <foaf:Organization>
        <foaf:name>${address.getOrganization()}</foaf:name>
        @if (address.getHomepage() != null)
        <foaf:homepage rdf:resource="${address.getHomepage()}" />@endif
        @if (!address.getEmails().isEmpty())
        <foaf:mbox rdf:resource="${address.getEmails().get(0)}" />@endif
        @if (address.hasAnyAddress())
            @template.export.opendata.rdf-address-location(address = address)
        @endif
    </foaf:Organization>
@endif
