@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.ProjectModelTransformerBaw
@import java.util.Map

@param Map<String, Object> map

!{var page = ((ProjectModelTransformerBaw)map.get("model"));}
@template.export.template-idf(content = @`
    @template.export.ingrid.idf.shared-general(page = page, additionalCitation = @`
<%--        @template.export.ingrid.idf.addresses(addresses = page.getManagerAdd(), wrapperElement = "gmd:citedResponsibleParty")--%>
<%--        @for ( String manager : page.getManagers())--%>
<%--        <gmd:citedResponsibleParty>--%>
<%--            <gmd:CI_ResponsibleParty>--%>
<%--                <gmd:individualName>--%>
<%--                    <gco:CharacterString>${manager}</gco:CharacterString>--%>
<%--                </gmd:individualName>--%>
<%--                <gmd:role>--%>
<%--                    <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="projectManager"/>--%>
<%--                </gmd:role>--%>
<%--            </gmd:CI_ResponsibleParty>--%>
<%--        </gmd:citedResponsibleParty>--%>
<%--        @endfor--%>
<%--        @for ( String participants : page.getParticipants())--%>
<%--        <gmd:citedResponsibleParty>--%>
<%--            <gmd:CI_ResponsibleParty>--%>
<%--                <gmd:individualName>--%>
<%--                    <gco:CharacterString>${participants}</gco:CharacterString>--%>
<%--                </gmd:individualName>--%>
<%--                <gmd:role>--%>
<%--                    <gmd:CI_RoleCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_RoleCode" codeListValue="projectParticipant"/>--%>
<%--                </gmd:role>--%>
<%--            </gmd:CI_ResponsibleParty>--%>
<%--        </gmd:citedResponsibleParty>--%>
<%--        @endfor--%>
    `)
`, abstract_text = page.getDescription())
