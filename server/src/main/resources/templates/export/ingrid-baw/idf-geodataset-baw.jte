@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.GeodatasetTransformerBaw
@import java.util.Map
@param Map<String, Object> map

!{var page = ((GeodatasetTransformerBaw)map.get("model"));}


@template.export.ingrid.idf.idf-geodataset(map = map, extraContent = @`
    <TODO></TODO>
`)
