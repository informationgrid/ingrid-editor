@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.PublicationModelTransformerBaw
@import java.util.Map
@param Map<String, Object> map

!{var page = ((PublicationModelTransformerBaw)map.get("model"));}


@template.export.ingrid.idf.idf-informationSystem(map = map)
