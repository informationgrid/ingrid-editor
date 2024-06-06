@import de.ingrid.igeserver.profiles.ingrid_bast.exporter.IngridModelTransformerBast
@import java.util.Map
@param Map<String, Object> map

!{var page = ((IngridModelTransformerBast)map.get("model"));}


@template.export.ingrid.template-lucene(map = map, extraFields = @`
    ,
    "distributor": "${page.getDistributorName()}"
`)
