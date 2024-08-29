@import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeneralMapper
@import gg.jte.support.ForSupport
@param GeneralMapper model

[
@for(var contact : ForSupport.of(model.getUniquePointOfContacts()))
    {
        "_uuid": "${contact.get().getRefUuid()}",
        "_type": "${contact.get().getAddressType()}",
        "title": "${contact.get().getTitle()}",
        @if(contact.get().isOrganization())
            "organization": "${contact.get().getOrganization()}",
        @elseif(contact.get().getPersonInfo() != null)
            "salutation": @template.imports.ingrid.partial.key-value(item = contact.get().getPersonInfo().getSalutation()),
            "firstName": "${contact.get().getPersonInfo().getFirstName()}",
            "lastName": "${contact.get().getPersonInfo().getLastName()}",
        @endif
        @if(contact.get().getAddress() != null)
            !{var address = contact.get().getAddress();}
            "address": {
            @if(address.getCity() != null)"city": "${address.getCity()}",@endif
            @if(address.getPOBox() != null)"po-box": "${address.getPOBox()}",@endif
            @if(address.getStreet() != null)"street": "${address.getStreet()}",@endif
            "country": @template.imports.ingrid.partial.key-value(item = address.getCountry()),
            @if(address.getZipCode() != null)"zip-code": "${address.getZipCode()}",@endif
            @if(address.getZipPOBox() != null)"zip-po-box": "${address.getZipPOBox()}",@endif
            "administrativeArea": @template.imports.ingrid.partial.key-value(item = address.getAdministrativeArea())
            },
        @endif
        "contact": [
        @for(var communication : ForSupport.of(contact.get().getCommunications()))
            {
            "type": @template.imports.ingrid.partial.key-value(item = communication.get().getType()),
            "connection": "${communication.get().getConnection()}"
            }@if (!communication.isLast()),@endif
        @endfor
        ],
        "positionName": "${contact.get().getPositionName()}",
        "hoursOfService": "${contact.get().getHoursOfService()}"
        @if(contact.get().getParent() != null), "parentAsUuid": "${contact.get().getParent()}"@endif
    }@if (!contact.isLast()),@endif
@endfor
]
