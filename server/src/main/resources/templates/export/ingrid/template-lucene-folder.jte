@import de.ingrid.igeserver.exporter.FolderModelTransformer
@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import java.util.Map

@param Map<String, Object> map

!{var page = ((FolderModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}

{
    "iPlugId": "ige-ng_${catalog.getIdentifier()}",
    "iplug_id": "ige-ng_${catalog.getIdentifier()}",
    "dataSourceName": "iPlug IGE-NG (${catalog.getIdentifier()})",
    "partner": [
        "${partner}"
    ],
    "provider": [
        "${provider}"
    ],
    "datatype": [
    @if("data".equals(page.getCategory()))
        "default",
        "dsc_ecs",
        "metadata",
    @else
        "address",
        "dsc_ecs_address",
    @endif
        "IDF_1.0"
    ],
    "boost": 0.1,

    "title": "${page.getModel().getTitle()}",
@if(page.getNextParent() != null)
    "parent.address_node.addr_uuid": "${page.getNextParent()}",
@endif
@if("data".equals(page.getCategory()))
    "t01_object.id": "${page.getUuid()}",
    "t01_object.obj_id": "${page.getUuid()}",
    "t01_object.org_obj_id": null,
    "t01_object.obj_class": "1000",
    "parent.object_node.obj_uuid": "${page.getHierarchyParent()}",
@else
    "t02_address.id": "${page.getUuid()}",
    "t02_address.adr_id": "${page.getUuid()}",
    "t02_address.typ": "1000",
@endif
    "isfolder": "true"
}
