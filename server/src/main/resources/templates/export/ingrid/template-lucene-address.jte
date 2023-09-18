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
    "t02_address.parents.title": [],
    "parent.address_node.addr_uuid": "${page.getGetParentUuid()}",
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
