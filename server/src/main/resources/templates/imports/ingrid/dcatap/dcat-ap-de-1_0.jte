@param de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.DcatApDeMapper model

{
    "title": "${model.getTitle()}",
    "_uuid": "${model.getUuid()}",
    "_parent": @if(model.getParentUuid() == null) null @else "${model.getParentUuid()}"@endif,
    "_type": "${model.getType()}",
    "description": "${model.getDescription()}",
    "pointOfContact": [
    @for(var contact : gg.jte.support.ForSupport.of(model.getPointOfContacts()))
        {
        "ref": {
        "_uuid": "${model.getAddressUuid(contact.get())}",
        "_type": "InGridOrganisationDoc",
        "title": "${contact.get().getHasOrganizationName()}",
        "organization": "${contact.get().getHasOrganizationName()}",
        !{var address = contact.get();}
        "address": {
        @if(address.getHasLocality() != null)"city": "${address.getHasLocality()}",@endif
        @if(address.getHasPostalCode() != null)"zip-code": "${address.getHasPostalCode()}",@endif
        @if(address.getHasStreetAddress() != null)"street": "${address.getHasStreetAddress()}",@endif
        "country": { "key": "276" }
        },
        "contact": [
        @if(address.getHasEmail() != null)
            {
            "type": { "key": "3" },
            "connection": "${address.getHasEmail()}"
            }@if(address.getHasTelephone() != null),@endif
        @endif
        @if(address.getHasTelephone() != null)
            {
            "type": { "key": "1" },
            "connection": "${address.getHasTelephone()}"
            }
        @endif
        ],
        "positionName": "${contact.get().getFn()}"
        },
        "type": { "key": "${contact.get().getType()}" }
        }@if (!contact.isLast()),@endif
    @endfor
    ]
}
