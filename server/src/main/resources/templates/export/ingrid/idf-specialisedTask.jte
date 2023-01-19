@import de.ingrid.igeserver.profiles.ingrid.exporter.DocInfo
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.IngridModel
@import java.util.Map

@param Map<String, Object> map

!{var page = ((IngridModel)map.get("model"));}
!{var docInfo = ((DocInfo)map.get("docInfo"));}

@template.template-idf(content = @`
    @template.ingrid.shared-general(page = page)
`)
