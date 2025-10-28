@import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer.SoftwareModelTransformerBaw
@import java.util.Map
@param Map<String, Object> map

!{var page = ((SoftwareModelTransformerBaw)map.get("model"));}


@template.export.ingrid.idf.idf-informationSystem(map = map, additionalIdentification = @`
    <software>
        <einsatzzweck>${page.getSoftwarePurpose()}</einsatzzweck>
        <Nutzerkreis>
            <baw>
                <gco:Boolean>${page.getUserGroupBaw()}</gco:Boolean>
            </baw>
            <wsv>
                <gco:Boolean>${page.getUserGroupWsv()}</gco:Boolean>
            </wsv>
            <extern>
                <gco:Boolean>${page.getUserGroupExtern()}</gco:Boolean>
            </extern>
            <anmerkungen>${page.getUserGroupNotes()}</anmerkungen>
        </Nutzerkreis>
        <ProduktiverEinsatz>
            <wsvAuftrag>
                <gco:Boolean>${page.getProductiveUseWsv()}</gco:Boolean>
            </wsvAuftrag>
            <fUndE>
                <gco:Boolean>${page.getProductiveUseFue()}</gco:Boolean>
            </fUndE>
            <andere>
                <gco:Boolean>${page.getProductiveUseOther()}</gco:Boolean>
            </andere>
            <anmerkungen>${page.getProductiveUseNotes()}</anmerkungen>
        </ProduktiverEinsatz>
        @for( String version : page.getServiceVersions())
            <Version>
                <version>${version}</version>
            </Version>
        @endfor
        <ErgaenzungsModul>
            <ergaenzungsModul>
                <gco:Boolean>${page.getHasSupplementaryModule()}</gco:Boolean>
            </ergaenzungsModul>
            <ergaenzteSoftware>${page.getNameOfSoftware()}</ergaenzteSoftware>
        </ErgaenzungsModul>
        <Betriebssystem>
            <windows>
                <gco:Boolean>${page.getOperatingSystemWindows()}</gco:Boolean>
            </windows>
            <linux>
                <gco:Boolean>${page.getOperatingSystemLinux()}</gco:Boolean>
            </linux>
            <anmerkungen>${page.getOperatingSystemNotes()}</anmerkungen>
        </Betriebssystem>
        @for( String language : page.getProgrammingLanguages())
            <Programmiersprache>
                <programmiersprache>${language}</programmiersprache>
            </Programmiersprache>
        @endfor
        @for( String environment : page.getDevelopmentEnvironment())
            <Entwicklungsumgebung>
                <entwicklungsumgebung>${environment}</entwicklungsumgebung>
            </Entwicklungsumgebung>
        @endfor
        @for( String library : page.getLibraries())
            <Bibliotheken>
                <bibliotheken>${library}</bibliotheken>
            </Bibliotheken>
        @endfor
        <Installationsort>
            <lokal>
                <gco:Boolean>${page.getInstallationLocal()}</gco:Boolean>
            </lokal>
            <HLR>
                <hlr>
                    <gco:Boolean>${page.getInstallationHlr()}</gco:Boolean>
                </hlr>
                <hlrName>${page.getHlrNames()}</hlrName>
            </HLR>
            <Server>
                <server>
                    <gco:Boolean>${page.getInstallationServer()}</gco:Boolean>
                </server>
                <servername>${page.getServerNames()}</servername>
            </Server>
        </Installationsort>
        <installationsMethode>${page.getInstallationMethod()}</installationsMethode>
        <QuellCodeRechte>
            <baw>
                <gco:Boolean>${page.getHasSourceRights()}</gco:Boolean>
            </baw>
            <anmerkungen>${page.getSourceRightsNotes()}</anmerkungen>
        </QuellCodeRechte>
        <NutzungsRechte>
            <dritte>
                <gco:Boolean>${page.getHasUsageRights()}</gco:Boolean>
            </dritte>
            <anmerkungen>${page.getUsageRightsNotes()}</anmerkungen>
        </NutzungsRechte>
    </software>
`)
