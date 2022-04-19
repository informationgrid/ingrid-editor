@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPNumber

@param UVPModel page

@template.uvp.template-idf(content = @`
    @template.uvp.shared-general(page = page)
    <uvpgs>
        @for(UVPNumber uvpNumber : page.getUvpNumbers())
            <uvpg category="${uvpNumber.getCategory()}"
                  type="${uvpNumber.getType()}">${uvpNumber.getUvpg()}</uvpg>
        @endfor
    </uvpgs>
    @template.uvp.shared-steps(page = page)
`)