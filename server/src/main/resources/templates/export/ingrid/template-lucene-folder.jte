@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import java.util.Map

@param Map<String, Object> map

!{var page = ((IngridModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}

{
    "iPlugId": "ige-ng_${catalog.getIdentifier()}",
    "dataSourceName": "iPlug IGE-NG (${catalog.getIdentifier()})",
    "partner": [
        "${partner}"
    ],
    "provider": [
        "${provider}"
    ],
    "datatype": [
        "default",
        "dsc_ecs",
        "metadata",
        "IDF_1.0"
    ],
    "boost": 0.1,

    "t01_object.id": "${page.handleContent(page.getModel().getUuid())}",
    "t01_object.obj_id": "${page.handleContent(page.getModel().getUuid())}",
    "title": "${page.getModel().getTitle()}",
    "t01_object.org_obj_id": null,
    "t01_object.obj_class": "${page.handleContent(page.getDocumentType())}",
    "summary": "${page.getData().getDescription()}",
    "t01_object.mod_time": "${page.formatDate(page.getFormatterNoSeparator(), page.getModel().get_contentModified())}",
    "isfolder": "true"
}
