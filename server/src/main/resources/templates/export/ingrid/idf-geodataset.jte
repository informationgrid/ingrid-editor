@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.GeodatasetModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.Citation
@import java.util.Map

@param Map<String, Object> map

!{var page = ((GeodatasetModelTransformer)map.get("model"));}

@template.template-idf(content = @`
    @template.ingrid.shared-general(
    page = page,
    contentInfo = @`
        @if (page.getHasContentInfo())
        <gmd:contentInfo>
            <gmd:MD_FeatureCatalogueDescription>
                @if (page.isAdVCompatible())
                    <gmd:language>
                        <gco:CharacterString>deutsch</gco:CharacterString>
                    </gmd:language>
                @endif
                <gmd:includedWithDataset>
                    <gco:Boolean>false</gco:Boolean>
                </gmd:includedWithDataset>
                @for (String featureType : page.getFeatureTypes())
                    <gmd:featureTypes>
                        <gco:LocalName>${featureType}</gco:LocalName>
                    </gmd:featureTypes>
                @endfor
                @for (Citation citation : page.getCitations())
                    <gmd:featureCatalogueCitation>
                        <gmd:CI_Citation>
                            <gmd:title>
                                <gco:CharacterString>${page.getCodelists().getValue("3535",citation.getTitle())}</gco:CharacterString>
                            </gmd:title>
                            <gmd:date>
                                <gmd:CI_Date>
                                    <gmd:date>
                                        <gco:DateTime>${page.formatDate(page.getFormatterISO(), citation.getDate())}</gco:DateTime>
                                    </gmd:date>
                                    <gmd:dateType>
                                        <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="creation"/>
                                    </gmd:dateType>
                                </gmd:CI_Date>
                            </gmd:date>
                            @if (TransformationTools.hasValue(citation.getEdition()))
                                <gmd:edition>
                                    <gco:CharacterString>${citation.getEdition()}</gco:CharacterString>
                                </gmd:edition>
                            @endif
                        </gmd:CI_Citation>
                    </gmd:featureCatalogueCitation>
                @endfor
            </gmd:MD_FeatureCatalogueDescription>
        </gmd:contentInfo>
        @endif
    `
    )
    @template.ingrid.dataQuality(page = page)
    @for(Citation citation : page.getPortrayalCatalogueCitations())
    <gmd:portrayalCatalogueInfo>
        <gmd:MD_PortrayalCatalogueReference>
            <gmd:portrayalCatalogueCitation>
                <gmd:CI_Citation>
                    <gmd:title>
                        <gco:CharacterString>${page.getCodelists().getValue("3555",citation.getTitle())}</gco:CharacterString>
                    </gmd:title>
                    <gmd:date>
                        <gmd:CI_Date>
                            <gmd:date>
                                <gco:DateTime>${page.formatDate(page.getFormatterISO(), citation.getDate())}</gco:DateTime>
                            </gmd:date>
                            <gmd:dateType>
                                <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="creation"/>
                            </gmd:dateType>
                        </gmd:CI_Date>
                    </gmd:date>
                    @if (TransformationTools.hasValue(citation.getEdition()))
                    <gmd:edition>
                        <gco:CharacterString>${citation.getEdition()}</gco:CharacterString>
                    </gmd:edition>
                    @endif
                </gmd:CI_Citation>
            </gmd:portrayalCatalogueCitation>
        </gmd:MD_PortrayalCatalogueReference>
    </gmd:portrayalCatalogueInfo>
    @endfor

`, abstract_text = page.getDescription())
