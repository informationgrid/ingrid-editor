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
    "iPlugId": "ige-ng_${catalog.getIdentifier()}",
    "dataSourceName": "iPlug IGE-NG (${catalog.getIdentifier()})",
    "title": "${page.getModel().getTitle()}",
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
    "isfolder": ${page.isFolder()},
    "t02_address.adr_id": "${page.getUuid()}",
    "t02_address.id": "${page.getId()}",
    "t02_address.typ": "${page.getAddressDocType()}",
    "is_top_level": null,

    "t02_address.lastname": "${page.getModel().getLastName()}",
    "t02_address.firstname": "${page.getModel().getFirstName()}",
    @if(page.getModel().getSalutation() != null)
    "t02_address.address_key": "${page.getModel().getSalutation().getKey()}",
    "t02_address.address_value": "${page.getCodelist().getValue("4300", page.getModel().getSalutation())}",
    @endif
    @if(page.getModel().getAcademicTitle() != null)
    "t02_address.title_key": "${page.getModel().getAcademicTitle().getKey()}",
    "t02_address.title": "${page.getCodelist().getValue("4305", page.getModel().getAcademicTitle())}",
    @endif
    "street": "${page.getModel().getAddress().getStreet()}",
    "zip": "${page.getModel().getAddress().getZipCode()}",
    "t02_address.postbox": "${page.getModel().getAddress().getPoBox()}",
    "t02_address.postbox_pc": "${page.getModel().getAddress().getZipPoBox()}",
    "city": "${page.getModel().getAddress().getCity()}",
    @if(page.getModel().getAddress().getCountry() != null)
    "t02_address.country_key": "${page.getModel().getAddress().getCountry().getKey()}",
    "t02_address.country_code": "${page.getCodelist().getValue("6200", page.getModel().getAddress().getCountry())}",
    @endif
    "summary": "${page.getModel().getPositionName()}",

@for(var entry : ForSupport.of(page.getParentAddresses()))
    @if(entry.isFirst())
        "parent.address_node.addr_uuid": "${entry.get().getUuid()}",
    @else
        "parent${entry.getIndex()}.address_node.addr_uuid": "${entry.get().getUuid()}",
    @endif
    "t02_address${entry.getIndex() + 1}.adr_id": "${entry.get().getUuid()}",
    "t02_address${entry.getIndex() + 1}.typ": "${page.getAddressDocType(entry.get().getDocType())}",
    "title${entry.getIndex() + 1}": "${entry.get().getOrganization()}",
    @if(!"FOLDER".equals(entry.get().getDocType()))
        "t02_address.parents.title": "${entry.get().getOrganization()}",
    @endif
@endfor

    "t021_communication.commtype_key": [
    @for(var entry : ForSupport.of(page.getModel().getContact()))
        "${entry.get().getType().getKey()}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t021_communication.commtype_value": [
    @for(var entry : ForSupport.of(page.getModel().getContact()))
        "${page.getCodelist().getValue("4430", entry.get().getType())}"@if (!entry.isLast()),@endif
    @endfor
    ],
    "t021_communication.comm_value": [
    @for(var entry : ForSupport.of(page.getModel().getContact()))
        "${entry.get().getConnection()}"@if (!entry.isLast()),@endif
    @endfor
    ]
}
