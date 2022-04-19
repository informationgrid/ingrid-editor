@import de.ingrid.igeserver.profiles.uvp.exporter.model.*
@import de.ingrid.igeserver.profiles.uvp.exporter.model.Step
@import de.ingrid.igeserver.profiles.uvp.exporter.model.StepPublicDisclosure
@import de.ingrid.igeserver.profiles.uvp.exporter.model.StepPublicHearing
@import de.ingrid.igeserver.profiles.uvp.exporter.model.StepDecisionOfAdmission

@param ApprovalProcedureModel page

<steps>
    @for(Step step : page.getSteps())
        @if (step instanceof StepPublicDisclosure)
            <step type="phase1">
                <datePeriod>
                    <from>${((StepPublicDisclosure) step).getDisclosureDate().getStart()}</from>
                    <to>${((StepPublicDisclosure) step).getDisclosureDate().getEnd()}</to>
                </datePeriod>
                @template.uvp.shared-docs(type = "technicalDocs", docs = ((StepPublicDisclosure) step).getAnnouncementDocs())
                @template.uvp.shared-docs(type = "applicationDocs", docs = ((StepPublicDisclosure) step).getApplicationDocs())
                @template.uvp.shared-docs(type = "reportsRecommendationsDocs", docs = ((StepPublicDisclosure) step).getReportsRecommendationDocs())
                @template.uvp.shared-docs(type = "moreDocs", docs = ((StepPublicDisclosure) step).getFurtherDocs())
            </step>
        @elseif (step instanceof StepPublicHearing)
            <step type="phase2">
                <datePeriod>
                    <from>${((StepPublicHearing) step).getPublicHearingDate().getStart()}</from>
                    <to>${((StepPublicHearing) step).getPublicHearingDate().getEnd()}</to>
                </datePeriod>
                @template.uvp.shared-docs(type = "considerationDocs", docs = ((StepPublicHearing) step).getConsiderationDocs())
            </step>
        @elseif (step instanceof StepDecisionOfAdmission)
            <step type="phase3">
                <date>
                    <from>${((StepDecisionOfAdmission) step).getDecisionDate()}</from>
                </date>
                @template.uvp.shared-docs(type = "approvalDocs", docs = ((StepDecisionOfAdmission) step).getApprovalDocs())
                @template.uvp.shared-docs(type = "designDocs", docs = ((StepDecisionOfAdmission) step).getDecisionDocs())
            </step>
        @endif
    @endfor
</steps>