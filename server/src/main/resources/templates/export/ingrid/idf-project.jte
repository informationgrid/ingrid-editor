@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.ProjectModelTransformer
@import java.util.Map

@param Map<String, Object> map

!{var page = ((ProjectModelTransformer)map.get("model"));}

@template.template-idf(content = @`
    @template.ingrid.shared-general(page = page, additionalCitation = @`
        @if(TransformationTools.hasValue(page.getManager()))
        <gmd:citedResponsibleParty>
            <gmd:CI_ResponsibleParty>
                <gmd:individualName>
                    <gco:CharacterString>${page.getManager()}</gco:CharacterString>
                </gmd:individualName>
                <gmd:role>
                    <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="projectManager"/>
                </gmd:role>
            </gmd:CI_ResponsibleParty>
        </gmd:citedResponsibleParty>
        @endif
        @if(TransformationTools.hasValue(page.getParticipants()))
        <gmd:citedResponsibleParty>
            <gmd:CI_ResponsibleParty>
                <gmd:individualName>
                    <gco:CharacterString>${page.getParticipants()}</gco:CharacterString>
                </gmd:individualName>
                <gmd:role>
                    <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="projectParticipant"/>
                </gmd:role>
            </gmd:CI_ResponsibleParty>
        </gmd:citedResponsibleParty>
        @endif
    `)
`, abstract_text = page.getDescription())
