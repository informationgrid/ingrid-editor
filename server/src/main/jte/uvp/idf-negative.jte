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
    <datePeriod type="uvpNegativeApprovalDate">
        <from>${page.getData().getDecisionDate()}</from>
    </datePeriod>
    @template.uvp.shared-docs(type = "uvpNegativeRelevantDocs", docs = page.getData().getUvpNegativeDecisionDocs())
    @template.uvp.shared-steps(page = page)
`)