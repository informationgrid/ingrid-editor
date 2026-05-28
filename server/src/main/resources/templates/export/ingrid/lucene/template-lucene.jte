@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import de.ingrid.igeserver.profiles.ingrid.exporter.IngridModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.CoordinateType
@import de.ingrid.igeserver.profiles.ingrid.types.InGridDocType
@import gg.jte.support.ForSupport
@import java.util.Map
@import gg.jte.Content

@param Content extraFields = null
@param Map<String, Object> map

!{var page = ((IngridModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}

{
"id": "${page.getModel().getUuid()}",
"schema_version": "0.0.1",
"metadata": {
"data_type": "INGRID",
"created": "${page.formatDate(page.getFormatterISO(), page.getModel().get_created())}",
"modified": "${page.formatDate(page.getFormatterISO(), page.getModel().get_contentModified())}",
"issued": null,
"partner": "${partner}",
"provider": "${provider}",
"language": "${page.getMetadataLanguage()}",
"datasource": {
"id": "${catalog.getIdentifier()}",
"name": "${catalog.getName()}"
}
},
    "title": "${page.getModel().getTitle()}",
"description": "${page.getData().getDescription()}",
    "spatial": {
        "geometries": [
        @for(var entry : ForSupport.of(page.getGeometries()))
            $unsafe{entry.get()}@if (!entry.isLast()),@endif
        @endfor

        ]
    },
"temporal": {
},
"keywords": "",
"sort_uuid": "",
"language": "",
"format": "???",
"contacts": ""
}
