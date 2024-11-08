@import de.ingrid.igeserver.profiles.ingrid_bkg.exporter.transformer.GeodatasetTransformerBkg
@import java.util.Map
@param Map<String, Object> map

!{var page = ((GeodatasetTransformerBkg)map.get("model"));}


@template.export.ingrid.lucene.template-lucene(map = map, extraFields = @`
    ,
    "t02_address.identificationinfo_administrative_area_value": "${page.getAdministrativeArea()}"
`)
