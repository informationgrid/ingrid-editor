@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPNumber
@import de.ingrid.igeserver.profiles.uvp.exporter.DocInfo
@import java.util.Map

@param Map<String, Object> map

!{var page = ((UVPModel)map.get("model"));}
!{var docInfo = ((DocInfo)map.get("docInfo"));}
!{page.getData().convertEiaNumbers(docInfo.getCatalogId());}

@template.template-idf(content = @`
    @template.uvp.shared-general(page = page)
    <uvpgs>
        @for(UVPNumber uvpNumber : page.getUvpNumbers())
            <uvpg category="${uvpNumber.getCategory()}"
                  type="${uvpNumber.getType()}">${uvpNumber.getUvpg()}</uvpg>
        @endfor
    </uvpgs>
    @template.uvp.shared-steps(page = page, docInfo = docInfo)
`)
