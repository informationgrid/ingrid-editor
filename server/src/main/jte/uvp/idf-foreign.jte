@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPModel
@import de.ingrid.igeserver.profiles.uvp.exporter.model.UVPNumber

@param UVPModel page

@template.uvp.template-idf(content = @`
    @template.uvp.shared-general(page = page)
    @template.uvp.shared-steps(page = page)
`)
