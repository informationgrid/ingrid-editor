@import de.ingrid.igeserver.exporter.AddressModelTransformer

@param AddressModelTransformer address
@if (address.isPerson())
    <foaf:Person>
        <foaf:name>${address.getFirstName()} ${address.getLastName()}</foaf:name>
        @if (address.getHomepage() != null)
        <foaf:homepage rdf:resource="${address.getHomepage()}" />@endif
        <foaf:givenName>${address.getFirstName()}</foaf:givenName>
        <foaf:familyName>${address.getLastName()}</foaf:familyName>
    </foaf:Person>
@else
    <foaf:Organization>
        <foaf:name>${address.getOrganization()}</foaf:name>
        @if (address.getHomepage() != null)
        <foaf:homepage rdf:resource="${address.getHomepage()}" />@endif
    </foaf:Organization>
@endif
