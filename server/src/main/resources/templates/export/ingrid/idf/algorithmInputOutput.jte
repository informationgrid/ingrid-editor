@import de.ingrid.igeserver.exporter.TransformationTools
@import de.ingrid.igeserver.profiles.ingrid.exporter.AlgorithmInputOutput
@import de.ingrid.igeserver.profiles.ingrid.exporter.AlgorithmAttribute
@import java.util.List

@param List<AlgorithmInputOutput> items
@param String wrapperElement

@for(AlgorithmInputOutput item : items)
    <alg:${wrapperElement}>
        <alg:InputData>
            <alg:name>
                <gco:CharacterString>${item.getName()}</gco:CharacterString>
            </alg:name>
            @if(TransformationTools.hasValue(item.getUrl()))
                <alg:url>
                    <gco:CharacterString>${item.getUrl()}</gco:CharacterString>
                </alg:url>
            @endif
            @for(AlgorithmAttribute attribute : item.getAttributes())
                <alg:attributes>
                    <alg:Attribute>
                        <alg:name>
                            <gco:CharacterString>${attribute.getName()}</gco:CharacterString>
                        </alg:name>
                        @if(TransformationTools.hasValue(attribute.getUnit()))
                            <alg:unit>
                                <gco:CharacterString>${attribute.getUnit()}</gco:CharacterString>
                            </alg:unit>
                        @endif
                        @if(TransformationTools.hasValue(attribute.getSpatialResolution()))
                            <alg:spatialResolution>
                                <gco:CharacterString>${attribute.getSpatialResolution()}</gco:CharacterString>
                            </alg:spatialResolution>
                        @endif
                        @if(TransformationTools.hasValue(attribute.getTemporalResolution()))
                            <alg:temporalResolution>
                                <gco:CharacterString>${attribute.getTemporalResolution()}</gco:CharacterString>
                            </alg:temporalResolution>
                        @endif
                    </alg:Attribute>
                </alg:attributes>
            @endfor
        </alg:InputData>
    </alg:${wrapperElement}>
@endfor
