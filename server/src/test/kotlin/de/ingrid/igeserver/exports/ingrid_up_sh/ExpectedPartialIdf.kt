package de.ingrid.igeserver.exports.ingrid_up_sh

const val geometryContextOther = """
            <gmd:spatialRepresentationInfo>
                <igctx:MD_GeometryContext gco:isoType="AbstractMD_SpatialRepresentation_Type">
                    <igctx:geometryType>
                        <gco:CharacterString>test-geometryType</gco:CharacterString>
                    </igctx:geometryType>
                    <igctx:geometricFeature>
                        <igctx:OtherFeature>
                            <igctx:featureName>
                                <gco:CharacterString>test-name</gco:CharacterString>
                            </igctx:featureName>
                            <igctx:featureDescription>
                                <gco:CharacterString>test-description</gco:CharacterString>
                            </igctx:featureDescription>
                            <igctx:featureDataType>
                                <gco:CharacterString>test-datatype</gco:CharacterString>
                            </igctx:featureDataType>
                            <igctx:featureAttributes>
                                <igctx:FeatureAttributes>
                                    <igctx:attribute>
                                        <igctx:OtherFeatureAttribute>
                                            <igctx:attributeDescription>
                                                <gco:CharacterString>one</gco:CharacterString>
                                            </igctx:attributeDescription>
                                            <igctx:attributeContent>
                                                <gco:CharacterString>1</gco:CharacterString>
                                            </igctx:attributeContent>
                                        </igctx:OtherFeatureAttribute>
                                    </igctx:attribute>
                                    <igctx:attribute>
                                        <igctx:OtherFeatureAttribute>
                                            <igctx:attributeDescription>
                                                <gco:CharacterString>two</gco:CharacterString>
                                            </igctx:attributeDescription>
                                            <igctx:attributeContent>
                                                <gco:CharacterString>2</gco:CharacterString>
                                            </igctx:attributeContent>
                                        </igctx:OtherFeatureAttribute>
                                    </igctx:attribute>
                                </igctx:FeatureAttributes>
                            </igctx:featureAttributes>
                            <igctx:minValue>
                                <gco:CharacterString>3.0</gco:CharacterString>
                            </igctx:minValue>
                            <igctx:maxValue>
                                <gco:CharacterString>12.0</gco:CharacterString>
                            </igctx:maxValue>
                            <igctx:units>
                                <gco:CharacterString>test-unit</gco:CharacterString>
                            </igctx:units>
                        </igctx:OtherFeature>
                    </igctx:geometricFeature>
                </igctx:MD_GeometryContext>
            </gmd:spatialRepresentationInfo>"""

const val geometryContextNominal = """
            <gmd:spatialRepresentationInfo>
                <igctx:MD_GeometryContext gco:isoType="AbstractMD_SpatialRepresentation_Type">
                    <igctx:geometryType>
                        <gco:CharacterString>test-geometryType</gco:CharacterString>
                    </igctx:geometryType>
                    <igctx:geometricFeature>
                        <igctx:NominalFeature>
                            <igctx:featureName>
                                <gco:CharacterString>test-name</gco:CharacterString>
                            </igctx:featureName>
                            <igctx:featureDescription>
                                <gco:CharacterString>test-description</gco:CharacterString>
                            </igctx:featureDescription>
                            <igctx:featureDataType>
                                <gco:CharacterString>test-datatype</gco:CharacterString>
                            </igctx:featureDataType>
                            <igctx:featureAttributes>
                                <igctx:FeatureAttributes>
                                    <igctx:attribute>
                                        <igctx:RegularFeatureAttribute>
                                            <igctx:attributeDescription>
                                                <gco:CharacterString>one</gco:CharacterString>
                                            </igctx:attributeDescription>
                                            <igctx:attributeCode>
                                                <gco:CharacterString>1</gco:CharacterString>
                                            </igctx:attributeCode>
                                        </igctx:RegularFeatureAttribute>
                                    </igctx:attribute>
                                    <igctx:attribute>
                                        <igctx:RegularFeatureAttribute>
                                            <igctx:attributeDescription>
                                                <gco:CharacterString>two</gco:CharacterString>
                                            </igctx:attributeDescription>
                                            <igctx:attributeCode>
                                                <gco:CharacterString>2</gco:CharacterString>
                                            </igctx:attributeCode>
                                        </igctx:RegularFeatureAttribute>
                                    </igctx:attribute>
                                </igctx:FeatureAttributes>
                            </igctx:featureAttributes>
                            <igctx:minValue>
                                <gco:CharacterString>3.0</gco:CharacterString>
                            </igctx:minValue>
                            <igctx:maxValue>
                                <gco:CharacterString>12.0</gco:CharacterString>
                            </igctx:maxValue>
                            <igctx:units>
                                <gco:CharacterString>test-unit</gco:CharacterString>
                            </igctx:units>
                        </igctx:NominalFeature>
                    </igctx:geometricFeature>
                </igctx:MD_GeometryContext>
            </gmd:spatialRepresentationInfo>"""