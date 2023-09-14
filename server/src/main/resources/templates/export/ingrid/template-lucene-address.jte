@import de.ingrid.igeserver.exporter.AddressModelTransformer
@import de.ingrid.igeserver.persistence.postgresql.jpa.model.ige.Catalog
@import java.util.Map

@param Map<String, Object> map

!{var page = ((AddressModelTransformer)map.get("model"));}
!{var catalog = ((Catalog)map.get("catalog"));}
!{var partner = ((String)map.get("partner"));}
!{var provider = ((String)map.get("provider"));}

{
    "iPlugId": "ige-ng:${catalog.getIdentifier()}",
    "dataSourceName": "iPlug IGE-NG (${catalog.getIdentifier()})",
    "title": "${page.getModel().getTitle()}"
}
