@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.AlgorithmModelTransformer
@import de.ingrid.igeserver.profiles.ingrid.exporter.AlgorithmAdditionalUrl
@import gg.jte.Content
@import java.util.Map

@param Map<String, Object> map

!{var page = ((AlgorithmModelTransformer)map.get("model"));}
@template.export.template-idf(content = @`
    @template.export.ingrid.idf.shared-general(
        page = page,
        additionalIdentification = @`
            @if(page.hasAlgorithmMetadata())
                <gmd:supplementalInformation>
                    <alg:Algorithm_Metadata xmlns:alg="https://www.ingrid-oss.eu/schemas/algorithmmd">
                        @if(TransformationTools.hasValue(page.getTrainingData()))
                            <alg:trainingData>
                                <gco:CharacterString>${page.getTrainingData()}</gco:CharacterString>
                            </alg:trainingData>
                        @endif
                        @if(TransformationTools.hasValue(page.getDataBias()))
                            <alg:dataBias>
                                <gco:CharacterString>${page.getDataBias()}</gco:CharacterString>
                            </alg:dataBias>
                        @endif
                        @template.export.ingrid.idf.algorithmInputOutput(items = page.getInputData(), wrapperElement = "inputData")
                        @template.export.ingrid.idf.algorithmInputOutput(items = page.getOutputData(), wrapperElement = "outputData")
                        @if(TransformationTools.hasValue(page.getAlgorithmType()))
                            <alg:algorithmType>
                                <gco:CharacterString>${page.getAlgorithmType()}</gco:CharacterString>
                            </alg:algorithmType>
                        @endif
                        @if(TransformationTools.hasValue(page.getExplanation()))
                            <alg:explanation>
                                <gco:CharacterString>${page.getExplanation()}</gco:CharacterString>
                            </alg:explanation>
                        @endif
                        @for(String method : page.getMethods())
                            <alg:method>
                                <gco:CharacterString>${method}</gco:CharacterString>
                            </alg:method>
                        @endfor
                        @if(TransformationTools.hasValue(page.getErrorBias()))
                            <alg:errorBias>
                                <gco:CharacterString>${page.getErrorBias()}</gco:CharacterString>
                            </alg:errorBias>
                        @endif
                        @if(TransformationTools.hasValue(page.getMonitoring()))
                            <alg:monitoring>
                                <gco:CharacterString>${page.getMonitoring()}</gco:CharacterString>
                            </alg:monitoring>
                        @endif
                        @if(TransformationTools.hasValue(page.getTypeOfUse()))
                            <alg:typeOfUse>
                                <gco:CharacterString>${page.getTypeOfUse()}</gco:CharacterString>
                            </alg:typeOfUse>
                        @endif
                        @if(TransformationTools.hasValue(page.getApiUrl()))
                            <alg:apiUrl>
                                <gco:CharacterString>${page.getApiUrl()}</gco:CharacterString>
                            </alg:apiUrl>
                        @endif
                        @if(TransformationTools.hasValue(page.getSourceCodeUrl()))
                            <alg:sourceCodeUrl>
                                <gco:CharacterString>${page.getSourceCodeUrl()}</gco:CharacterString>
                            </alg:sourceCodeUrl>
                        @endif
                        @if(TransformationTools.hasValue(page.getWebsiteUrl()))
                            <alg:websiteUrl>
                                <gco:CharacterString>${page.getWebsiteUrl()}</gco:CharacterString>
                            </alg:websiteUrl>
                        @endif
                        @if(TransformationTools.hasValue(page.getExampleUrl()))
                            <alg:exampleUrl>
                                <gco:CharacterString>${page.getExampleUrl()}</gco:CharacterString>
                            </alg:exampleUrl>
                        @endif
                        @if(TransformationTools.hasValue(page.getPubliccodeUrl()))
                            <alg:publiccodeUrl>
                                <gco:CharacterString>${page.getPubliccodeUrl()}</gco:CharacterString>
                            </alg:publiccodeUrl>
                        @endif
                        @for(AlgorithmAdditionalUrl additionalUrl : page.getAdditionalUrls())
                            <alg:additionalUrl>
                                <alg:name>
                                    <gco:CharacterString>${additionalUrl.getName()}</gco:CharacterString>
                                </alg:name>
                                <alg:url>
                                    <gco:CharacterString>${additionalUrl.getUrl()}</gco:CharacterString>
                                </alg:url>
                            </alg:additionalUrl>
                        @endfor
                    </alg:Algorithm_Metadata>
                </gmd:supplementalInformation>
            @endif
        `
    )
`, abstract_text = page.getDescription())
