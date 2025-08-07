@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.ProjectModelTransformerBaw
@import java.util.Map
@param Map<String, Object> map

!{var page = ((ProjectModelTransformerBaw)map.get("model"));}


@template.export.ingrid-baw.lucene.template-lucene-baw(map = map, extraFields = @`
    ,
    "bawauftragsnummer": "${page.getOrderNumber()}"
`)
