/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.2 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * https://joinup.ec.europa.eu/software/page/eupl
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 */
package de.ingrid.igeserver.exports.ingrid_up_sh

const val GEOMETRY_CONTEXT_OTHER = """
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

const val GEOMETRY_CONTEXT_NOMINAL = """
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
