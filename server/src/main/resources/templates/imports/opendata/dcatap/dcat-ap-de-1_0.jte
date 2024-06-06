@param de.ingrid.igeserver.profiles.ingrid.importer.dcatapde.DcatApDeMapper model

{
    "title": "${model.getTitle()}",
    "_uuid": "${model.getUuid()}",
    "_parent": @if(model.getParentUuid() == null) null @else "${model.getParentUuid()}"@endif,
    "_type": "OpenDataDoc",
    "description": "${model.getDescription()}",
    "addresses": [
    @for(var contact : gg.jte.support.ForSupport.of(model.getPointOfContacts()))
        {
        "ref": {
        "_uuid": "${model.getAddressUuid(contact.get())}",
        "_type": "OpenDataAddressDoc",
        "title": "${model.getContactTitle(contact.get())}",
        "organization": "${model.getContactTitle(contact.get())}",
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
    ],
    "distributions": [
    @for(var distribution : gg.jte.support.ForSupport.of(model.getDistributions()))
        {
            "link": {
                "uri": "${distribution.get().getAccessURL()}",
                "value": "${distribution.get().getAccessURL()}",
                "asLink": false,
                "lastModified": "${model.formatDate(distribution.get().getModified())}"
            },
            "title": "${distribution.get().getTitle()}",
            "format": {
                "key": "ZIP"
            },
            "license": null,
            "byClause": "",
            "modified": "${model.formatDate(distribution.get().getModified())}",
            "languages": [],
            "description": "${distribution.get().getDescription()}",
            "availability": null
        }@if (!distribution.isLast()),@endif
    @endfor
    ],
    "DCATThemes": [
    @for(var category : gg.jte.support.ForSupport.of(model.getOpenDataCategories()))
    @endfor
    ]
}
