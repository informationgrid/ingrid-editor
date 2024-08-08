@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.DataCollectionModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.CategoryCatalog
@import de.ingrid.igeserver.profiles.ingrid.exporter.model.Citation
@import java.util.Map

@param Map<String, Object> map

!{var page = ((DataCollectionModelTransformer)map.get("model"));}
@template.export.template-idf(content = @`
    @template.export.ingrid.idf.shared-general(page = page, contentInfo = @`
        @if (page.hasContentInfo())
            <gmd:contentInfo>
                <gmd:MD_FeatureCatalogueDescription>
                    <gmd:includedWithDataset>
                        <gco:Boolean>false</gco:Boolean>
                    </gmd:includedWithDataset>
                    @if (page.isAdVCompatible())
                        <gmd:language>
                            <gco:CharacterString>deutsch</gco:CharacterString>
                        </gmd:language>
                    @endif
                    @for (String dbContent : page.getDatabaseContent())
                        <gmd:featureTypes>
                            <gco:LocalName>${dbContent}</gco:LocalName>
                        </gmd:featureTypes>
                    @endfor
                    @for (CategoryCatalog category : page.getCategoryCatalog())
                        <gmd:featureCatalogueCitation>
                            <gmd:CI_Citation>
                                <gmd:title>
                                    <gco:CharacterString>${page.getCodelists().getCatalogCodelistValue("3535",category.getTitle())}</gco:CharacterString>
                                </gmd:title>
                                <gmd:date>
                                    <gmd:CI_Date>
                                        @if(category.getDate() != null)
                                            <gmd:date>
                                                <gco:DateTime>${page.formatDate(page.getFormatterISO(), category.getDate())}</gco:DateTime>
                                            </gmd:date>
                                        @else
                                            <gmd:date gco:nilReason="missing"/>
                                        @endif
                                        <gmd:dateType>
                                            <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="creation"/>
                                        </gmd:dateType>
                                    </gmd:CI_Date>
                                </gmd:date>
                                @if (TransformationTools.hasValue(category.getEdition()))
                                    <gmd:edition>
                                        <gco:CharacterString>${category.getEdition()}</gco:CharacterString>
                                    </gmd:edition>
                                @endif
                            </gmd:CI_Citation>
                        </gmd:featureCatalogueCitation>
                    @endfor
                    @if (page.getCategoryCatalog().isEmpty())
                        <gmd:featureCatalogueCitation>
                            <gmd:CI_Citation>
                                <gmd:title>
                                    <gco:CharacterString>unknown</gco:CharacterString>
                                </gmd:title>
                                <gmd:date>
                                    <gmd:CI_Date>
                                        <gmd:date>
                                            <gco:DateTime>2006-05-01</gco:DateTime>
                                        </gmd:date>
                                        <gmd:dateType>
                                            <gmd:CI_DateTypeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#CI_DateTypeCode" codeListValue="publication">publication</gmd:CI_DateTypeCode>
                                        </gmd:dateType>
                                    </gmd:CI_Date>
                                </gmd:date>
                            </gmd:CI_Citation>
                        </gmd:featureCatalogueCitation>
                    @endif
                </gmd:MD_FeatureCatalogueDescription>
            </gmd:contentInfo>
        @endif
    `)
    @if (TransformationTools.hasValue(page.getMethodText()))
        <gmd:dataQualityInfo>
            <gmd:DQ_DataQuality>
                <gmd:scope>
                    <gmd:DQ_Scope>
                        <gmd:level>
                            <gmd:MD_ScopeCode codeList="http://standards.iso.org/iso/19139/resources/gmxCodelists.xml#MD_ScopeCode" codeListValue="nonGeographicDataset"/>
                        </gmd:level>
                        <gmd:levelDescription>
                            <gmd:MD_ScopeDescription>
                                <gmd:other>
                                    <gco:CharacterString>data collection</gco:CharacterString>
                                </gmd:other>
                            </gmd:MD_ScopeDescription>
                        </gmd:levelDescription>
                    </gmd:DQ_Scope>
                </gmd:scope>
                <gmd:lineage>
                    <gmd:LI_Lineage>
                        <gmd:source>
                            <gmd:LI_Source>
                                <gmd:description>
                                    <gco:CharacterString>${page.getMethodText()}</gco:CharacterString>
                                </gmd:description>
                            </gmd:LI_Source>
                        </gmd:source>
                    </gmd:LI_Lineage>
                </gmd:lineage>
            </gmd:DQ_DataQuality>
        </gmd:dataQualityInfo>
    @endif
`, abstract_text = page.getDescription())
