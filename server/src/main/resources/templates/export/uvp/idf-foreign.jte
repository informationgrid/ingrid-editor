@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import de.ingrid.igeserver.profiles.uvp.exporter.DocInfo
@import java.util.Map

@param Map<String, Object> map

!{var page = ((UVPModel)map.get("model"));}
!{var docInfo = ((DocInfo)map.get("docInfo"));}

@template.template-idf(content = @`
    @template.uvp.shared-general(page = page)
    @template.uvp.shared-steps(page = page, docInfo = docInfo)
`)
