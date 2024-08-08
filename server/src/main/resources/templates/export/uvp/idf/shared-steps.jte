@import de.ingrid.igeserver.profiles.uvp.exporter.DocInfo
@import de.ingrid.igeserver.profiles.uvp.exporter.model.*
@import de.ingrid.igeserver.profiles.uvp.exporter.model.Step
@import de.ingrid.igeserver.profiles.uvp.exporter.model.StepPublicDisclosure
@import de.ingrid.igeserver.profiles.uvp.exporter.model.StepPublicHearing
@import de.ingrid.igeserver.profiles.uvp.exporter.model.StepDecisionOfAdmission

@param UVPModel page
@param DocInfo docInfo

<steps>
    @for(Step step : page.getSteps())
        @if (step instanceof StepPublicDisclosure)
            <step type="phase1">
                <datePeriod>
                    <from>${((StepPublicDisclosure) step).getDisclosureDate().getStart()}</from>
                    <to>${((StepPublicDisclosure) step).getDisclosureDate().getEnd()}</to>
                </datePeriod>
                @if(((StepPublicDisclosure) step).isPublishable("announcementDocs"))
                    @template.export.uvp.idf.shared-docs(type = "technicalDocs", docs = ((StepPublicDisclosure) step).getAnnouncementDocs(), docInfo = docInfo)
                @endif
                @if(((StepPublicDisclosure) step).isPublishable("applicationDocs"))
                    @template.export.uvp.idf.shared-docs(type = "applicationDocs", docs = ((StepPublicDisclosure) step).getApplicationDocs(), docInfo = docInfo)
                @endif
                @if(((StepPublicDisclosure) step).isPublishable("reportsRecommendationDocs"))
                    @template.export.uvp.idf.shared-docs(type = "reportsRecommendationsDocs", docs = ((StepPublicDisclosure) step).getReportsRecommendationDocs(), docInfo = docInfo)
                @endif
                @if(((StepPublicDisclosure) step).isPublishable("furtherDocs"))
                    @template.export.uvp.idf.shared-docs(type = "moreDocs", docs = ((StepPublicDisclosure) step).getFurtherDocs(), docInfo = docInfo)
                @endif
            </step>
        @elseif (step instanceof StepPublicHearing)
            <step type="phase2">
                <datePeriod>
                    <from>${((StepPublicHearing) step).getPublicHearingDate().getStart()}</from>
                    <to>${((StepPublicHearing) step).getPublicHearingDate().getEnd()}</to>
                </datePeriod>
                @template.export.uvp.idf.shared-docs(type = "considerationDocs", docs = ((StepPublicHearing) step).getConsiderationDocs(), docInfo = docInfo)
            </step>
        @elseif (step instanceof StepDecisionOfAdmission)
            <step type="phase3">
                <date>
                    <from>${((StepDecisionOfAdmission) step).getDecisionDate()}</from>
                </date>
                @template.export.uvp.idf.shared-docs(type = "approvalDocs", docs = ((StepDecisionOfAdmission) step).getApprovalDocs(), docInfo = docInfo)
                @template.export.uvp.idf.shared-docs(type = "designDocs", docs = ((StepDecisionOfAdmission) step).getDecisionDocs(), docInfo = docInfo)
            </step>
        @endif
    @endfor
</steps>
