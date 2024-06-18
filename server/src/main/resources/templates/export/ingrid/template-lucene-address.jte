@import de.ingrid.igeserver.exporter.AddressModelTransformer
@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import gg.jte.support.ForSupport
@import java.util.Map

@param Map<String, Object> map

!{var page = ((AddressModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}

{
    "iplug_id": "ige-ng_${catalog.getIdentifier()}",
    "dataSourceName": "iPlug IGE-NG (${catalog.getIdentifier()})",
    "title": "${page.getDoc().getTitle()}",
    "partner": [
        "${partner}"
    ],
    "provider": [
        "${provider}"
    ],
    "datatype": [
        "address",
        "dsc_ecs_address",
        "IDF_1.0"
    ],
    "boost": 0.1,
    "t02_address.adr_id": "${page.getUuid()}",
    "t02_address.id": "${page.getId()}",
    "t02_address.typ": "${page.getAddressDocType()}",

    "t02_address.lastname": "${page.getLastName()}",
    "t02_address.firstname": "${page.getFirstName()}",
    @if(page.getSalutation() != null)
    "t02_address.address_key": "${page.getSalutation().getKey()}",
    "t02_address.address_value": "${page.getCodelist().getValue("4300", page.getSalutation())}",
    @endif
    @if(page.getAcademicTitle() != null)
    "t02_address.title_key": "${page.getAcademicTitle().getKey()}",
    "t02_address.title": "${page.getCodelist().getValue("4305", page.getAcademicTitle())}",
    @endif
    "street": "${page.getStreet()}",
    "zip": "${page.getZipCode()}",
    "t02_address.postbox": "${page.getPoBox()}",
    "t02_address.postbox_pc": "${page.getZipPoBox()}",
    "city": "${page.getCity()}",
    @if(page.getCountry() != null)
    "t02_address.country_key": "${page.getCountryKey()}",
    "t02_address.country_code": "${page.getCodelist().getValue("6200", page.getCountry())}",
    @endif
    "summary": "${page.getPositionName()}",

    @if(page.getNextParent() != null)
    "parent.address_node.addr_uuid": "${page.getNextParent()}",
    @endif

@for(var entry : ForSupport.of(page.getParentAddresses()))
    @if(entry.isFirst())
        "parent.address_node.addr_uuid": "${entry.get().getDocument().getUuid()}",
    @else
        "parent${entry.getIndex()}.address_node.addr_uuid": "${entry.get().getDocument().getUuid()}",
    @endif
    "t02_address${entry.getIndex() + 1}.adr_id": "${entry.get().getDocument().getUuid()}",
    "t02_address${entry.getIndex() + 1}.typ": "${page.getAddressDocType(entry.get().getDocument().type)}",
    "title${entry.getIndex() + 1}": "${entry.get().getDocument().data.get("organization").asText()}",
    "t02_address.parents.title": "${entry.get().getDocument().data.get("organization").asText()}",
@endfor

    "t021_communication.commtype_key": [
    @for(var entry : ForSupport.of(page.getContactsComTypeKeys()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t021_communication.commtype_value": [
    @for(var entry : ForSupport.of(page.getContactsComTypeValues()))
        "${page.getCodelist().getValue("4430", entry.get())}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t021_communication.comm_value": [
    @for(var entry : ForSupport.of(page.getContactsComConnections()))
        "${entry.get()}"@if (!entry.isLast()),@endif
    @endfor
    ]
}
