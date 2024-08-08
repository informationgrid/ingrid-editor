@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import de.ingrid.igeserver.profiles.uvp.exporter.DocInfo
@import java.util.Map

@param Map<String, Object> map

!{var page = ((UVPModel)map.get("model"));}
!{var docInfo = ((DocInfo)map.get("docInfo"));}

@template.export.template-idf(content = @`
    @template.export.uvp.idf.shared-general(page = page)
    @template.export.uvp.idf.shared-steps(page = page, docInfo = docInfo)
`)
