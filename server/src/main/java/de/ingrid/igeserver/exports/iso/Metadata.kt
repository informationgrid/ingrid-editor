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
package de.ingrid.igeserver.exports.iso

import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlProperty
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlRootElement
import com.fasterxml.jackson.dataformat.xml.annotation.JacksonXmlText

//@XmlRootElement(name = "MD_Metadata", namespace = "http://www.isotc211.org/2005/gmd")
//@XmlAccessorType(XmlAccessType.FIELD)
@JacksonXmlRootElement(
    namespace = "http://www.isotc211.org/2005/gmd",
    //propOrder = ["fileIdentifier", "language", "characterSet", "parentIdentifier", "hierarchyLevel", "hierarchyLevelName", "contact", "dateStamp", "metadataStandardName", "metadataStandardVersion", "dataSetURI", "locale", "spatialRepresentationInfo", "referenceSystemInfo", "metadataExtensionInfo", "identificationInfo", "contentInfo", "distributionInfo", "dataQualityInfo", "portrayalCatalogueInfo", "metadataConstraints", "applicationSchemaInfo", "metadataMaintenance", "series", "describes", "propertyType", "featureType", "featureAttribute"]
)
data class Metadata(
    var fileIdentifier: CharacterString? = null,
    var characterSet: CharacterSetCode? = null,
    var language: LanguageCode? = null,
    var parentIdentifier: CharacterString? = null,
    var hierarchyLevel: List<ScopeCode>? = null,
    val hierarchyLevelName: List<CharacterString>? = null,
    var contact: List<Contact>,
    var dateStamp: Date,
    val metadataStandardName: CharacterString = CharacterString("ISO19119"),
    val metadataStandardVersion: CharacterString = CharacterString("2005/PDAM 1"),
    val dataSetURI: String? = null,
    val locale: List<String>? = null,
    val spatialRepresentationInfo: List<SpatialRepresentationInfo>? = null,
    val referenceSystemInfo: List<ReferenceSystem>? = null,
    val metadataExtensionInfo: List<String>? = null,
    val identificationInfo: List<IdentificationInfo>,
    val contentInfo: List<ContentInfo>? = null,
    val distributionInfo: DistributionInfo? = null,
    val dataQualityInfo: List<DataQualityInfo>? = null,
    val portrayalCatalogueInfo: List<PortrayalCatalogueInfo>? = null,
    val metadataConstraints: List<String>? = null,
    val applicationSchemaInfo: List<String>? = null,
    val metadataMaintenance: String? = null,
    val series: List<String>? = null,
    val describes: List<String>? = null,
    val propertyType: List<String>? = null,
    val featureType: List<String>? = null,
    val featureAttribute: List<String>? = null) {

    /*fun setUuid(uuid: String?) {
        fileIdentifier = CharacterString(uuid)
    }*/

/*    val fieldIdentifier: String?
        get() = fileIdentifier!!.text*/

/*
    fun setLanguage(language: String) {
        this.language = LanguageCode().apply {
            codelist = CodelistAttributes(
                "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#LanguageCode",
                language,
                language
            )
        }
    }
*/

/*
    fun getLanguage(): String? {
        return language!!.codelist!!.content
    }
*/

/*
    fun setCharacterSet() {
        this.characterSet = CharacterSetCode()
        this.characterSet!!.characterSetCode = CodelistAttributes(
            "http://standards.iso.org/ittf/PubliclyAvailableStandards/ISO_19139_Schemas/resources/codelist/ML_gmxCodelists.xml#MD_CharacterSetCode",
            "utf8"
        )
    }
*/

/*
    fun setParentIdentifier(parentUuid: String?) {
        parentIdentifier = CharacterString(parentUuid)
    }
*/

/*
    fun setHierarchyLevel(level: String?) {
        val scopeCode = ScopeCode()
        scopeCode.codelist = CodelistAttributes(
            "http://www.tc211.org/ISO19139/resources/codeList.xml#MD_ScopeCode",
            level,
            level
        )
        hierarchyLevel = scopeCode
    }
*/

/*    fun setContact(uuid: String?, role: String?) {
        contact = Contact()
        val responsibleParty = ResponsibleParty()
        responsibleParty.uuid = uuid
        *//*responsibleParty.setRole(
            CodelistAttributes(
                "http://www.tc211.org/ISO19139/resources/codeList.xml#CI_RoleCode",
                role
            )
        )*//*
        val ci = ContactInfo()
        ci.setAddress( "xxx@yyy.zz")
        responsibleParty.contactInfo = ci
        contact!!.responsibleParty = responsibleParty
    }*/

//    fun setDateStamp(date: String?) {
//        dateStamp = Date(date)
//    }
}

data class DistributionInfo(
    @JacksonXmlProperty(localName = "MD_Distribution") val mdDistribution: MDDistribution?
)

data class MDDistribution(
    val distributionFormat: List<DistributionFormat>?,
    val distributor: List<Distributor>?,
    val transferOptions: List<TransferOption>?
)

data class DistributionFormat(
    @JacksonXmlProperty(localName = "MD_Format") val format: MDFormat?
)

data class MDFormat(
    val name : CharacterString,
    val version : CharacterString?,
    val amendmentNumber : CharacterString?,
    val specification : CharacterString?,
    val fileDecompressionTechnique : CharacterString?,
    val formatDistributor : List<CharacterString>?
)

data class Distributor(
    @JacksonXmlProperty(localName = "MD_Distributor") val mdDistributor: MDDistributor 
)

data class MDDistributor(
    val distributorContact: Contact,
    val distributionOrderProcess: List<DistributionOrderProcess>?,
    val distributorFormat: List<CharacterString>?,
    val distributorTransferOptions: List<CharacterString>?,
)

data class DistributionOrderProcess(
    @JacksonXmlProperty(localName = "MD_StandardOrderProcess") val mdStandardOrderProcess: MDStandardOrderProcess?
)

data class MDStandardOrderProcess(
    val fees: CharacterString?,
    val plannedAvailableDateTime: CharacterString?,
    val orderingInstructions: CharacterString?,
    val turnaround: CharacterString?
)

data class TransferOption(
    @JacksonXmlProperty(localName = "MD_DigitalTransferOptions") val mdDigitalTransferOptions: MDDigitalTransferOptions?
)

data class MDDigitalTransferOptions(
    val unitsOfDistribution: CharacterString?,
    val transferSize: Real?,
    val onLine: List<Online>?,
    val offLine: Offline?
)

data class Online(
    @JacksonXmlProperty(localName = "CI_OnlineResource") val ciOnlineResource: CIOnlineResource?
)

data class Offline(
    @JacksonXmlProperty(localName = "MD_Medium") val mdMedium: MDMedium?
)

data class MDMedium(
    val name: MDMediumNameCode?,
    val density: List<CharacterString>?,
    val densityUnits: CharacterString?,
    val volumes: CharacterString?,
    val mediumFormat: List<CharacterString>?,
    val mediumNote: CharacterString?
)

data class MDMediumNameCode(
    @JacksonXmlProperty(localName = "MD_MediumNameCode") val code: CodelistAttributes?
)

data class DataQualityInfo(
    @JacksonXmlProperty(localName = "DQ_DataQuality") val dqDataQuality: DQDataQuality?
)

data class SpatialRepresentationInfo(
    @JacksonXmlProperty(localName = "MD_VectorSpatialRepresentation") val mdVectorSpatialRepresentation: MDVectorSpatialRepresentation?,
    @JacksonXmlProperty(localName = "MD_GridSpatialRepresentation") val mdGridSpatialRepresentation: MDGridSpatialRepresentation?,
    @JacksonXmlProperty(localName = "MD_Georeferenceable") val mdGeoreferenceable: MDGeoreferenceable?,
    @JacksonXmlProperty(localName = "MD_Georectified") val mdGeorectified: MDGeorectified?,
    @JacksonXmlProperty(localName = "MD_GeometryContext") val mdGeometryContext: MDGeometryContext?
)

data class MDGeometryContext(
    val geometryType: CharacterString?,
    val geometricFeature: GeometricFeature?
)

data class GeometricFeature(
    @JacksonXmlProperty(localName = "NominalFeature") val nominalFeature: SpecificGeometricFeature?,
    @JacksonXmlProperty(localName = "OrdinalFeature") val ordinalFeature: SpecificGeometricFeature?,
    @JacksonXmlProperty(localName = "ScalarFeature") val scalarFeature: SpecificGeometricFeature?,
    @JacksonXmlProperty(localName = "OtherFeature") val otherFeature: SpecificGeometricFeature?,
)

data class SpecificGeometricFeature(
    val featureName: CharacterString?,
    val featureDescription: CharacterString?,
    val featureDataType: CharacterString?,
    val featureAttributes: FeatureAttributes2?,
    val minValue: CharacterString?,
    val maxValue: CharacterString?,
    val units: CharacterString?
)

data class FeatureAttributes2(
    @JacksonXmlProperty(localName = "FeatureAttributes") val featureAttributes: FeatureAttributes
)

data class FeatureAttributes(
    val attribute: List<FeatureAttribute>?
)

data class FeatureAttribute(
    val RegularFeatureAttribute: SpecificFeatureAttribute?,
    val OtherFeatureAttribute: SpecificFeatureAttribute?
)

data class SpecificFeatureAttribute(
    val attributeDescription: CharacterString?,
    val attributeContent: CharacterString?,
    val attributeCode: CharacterString?
)

data class MDGeoreferenceable(
    val numberOfDimensions: MDInteger,
    val axisDimensionProperties: List<AxisDimensionProperty>,
    val cellGeometry: CellGeometry,
    val transformationParameterAvailability: MDBoolean,
    val controlPointAvailability: MDBoolean,
    val orientationParameterAvailability: MDBoolean,
    val orientationParameterDescription: CharacterString?,
    val georeferencedParameters: RecordAsCharacterString,
    val parameterCitation: List<Citation>?,
)

data class MDGeorectified(
    val numberOfDimensions: MDInteger,
    val axisDimensionProperties: List<AxisDimensionProperty>,
    val cellGeometry: CellGeometry,
    val transformationParameterAvailability: MDBoolean,
    val checkPointAvailability: MDBoolean?,
    val checkPointDescription: CharacterString?,
    val cornerPoints: List<Point>,
    val centerPoint: MDDistance?,
    val pointInPixel: PointInPixel,
    val transformationDimensionDescription: CharacterString?,
    val transformationDimensionMapping: CharacterString?,
)

data class PointInPixel(
    @JacksonXmlProperty(localName = "MD_PixelOrientationCode") val mdPixelOrientationCode: String?
)

data class MDVectorSpatialRepresentation(
    val topologyLevel: TopologyLevel?,
    val geometricObjects: List<GeometricObject>?
)

data class MDGridSpatialRepresentation(
    val numberOfDimensions: MDInteger,
    val axisDimensionProperties: List<AxisDimensionProperty>,
    val cellGeometry: CellGeometry,
    val transformationParameterAvailability: MDBoolean
)

data class AxisDimensionProperty(
    @JacksonXmlProperty(localName = "MD_Dimension") val mdDimension: MDDimension? 
)

data class MDDimension(
    val dimensionName: DimensionName,
    val dimensionSize: MDInteger,
    val resolution: Scale?
)

data class Scale(
    @JacksonXmlProperty(localName = "Scale") val scale: MDScale?
)

data class DimensionName(
    @JacksonXmlProperty(localName = "MD_DimensionNameTypeCode") val mdDimensionNameTypeCode: CodelistAttributes
)

data class CellGeometry(
    @JacksonXmlProperty(localName = "MD_CellGeometryCode") val mdCellGeometryCode: CodelistAttributes?
)

data class TopologyLevel(
    @JacksonXmlProperty(localName = "MD_TopologyLevelCode") val value: CodelistAttributes?
)

data class GeometricObject(
    @JacksonXmlProperty(localName = "MD_GeometricObjects") val value: MDGeometricObject?
)

data class MDGeometricObject(
    val geometricObjectType: GeometricObjectType,
    val geometricObjectCount: MDInteger?,
)

data class GeometricObjectType(
    @JacksonXmlProperty(localName = "MD_GeometricObjectTypeCode") val value: CodelistAttributes?
)

data class Point(
    @JacksonXmlProperty(localName = "Point", namespace = "http://www.opengis.net/gml/3.2") val point: Coordinates
)

data class Coordinates(
    @JacksonXmlProperty(localName = "coordinates", namespace = "http://www.opengis.net/gml/3.2") val coordinates: String?
)

data class DQDataQuality(
    val scope: Scope,
    val report: List<DQReport>?,
    val lineage: Lineage?
)

data class Lineage(
    @JacksonXmlProperty(localName = "LI_Lineage") val liLinage: LILinage?
)

data class LILinage(
    val statement: CharacterString?,
    val processStep: List<ProcessStep>?,
    val source: List<Source>?
)

data class ProcessStep(
    @JacksonXmlProperty(localName = "LI_ProcessStep") val liProcessStep: LIProcessStep
)

data class LIProcessStep(
    val description: CharacterString
)

data class Source(
    @JacksonXmlProperty(localName = "LI_Source") val liSource: LISource?
)

data class LISource(
    val description: CharacterString?
)

data class DQReport(
    @JacksonXmlProperty(localName = "DQ_TemporalValidity") val dqTemporalValidity: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_TemporalConsistency") val dqTemporalConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_AccuracyOfATimeMeasurement") val dqAccuracyOfATimeMeasurement: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_QuantitativeAttributeAccuracy") val dqQuantitativeAttributeAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_NonQuantitativeAttributeAccuracy") val dqNonQuantitativeAttributeAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_ThematicClassificationCorrectness") val dqThematicClassificationCorrectness: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_RelativeInternalPositionalAccuracy") val dqRelativeInternalPositionalAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_GriddedDataPositionalAccuracy") val dqGriddedDataPositionalAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_AbsoluteExternalPositionalAccuracy") val dqAbsoluteExternalPositionalAccuracy: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_TopologicalConsistency") val dqTopologicalConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_FormatConsistency") val dqFormatConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_DomainConsistency") val dqDomainConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_ConceptualConsistency") val dqConceptualConsistency: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_CompletenessOmission") val dqCompletenessOmission: DQReportElement?,
    @JacksonXmlProperty(localName = "DQ_CompletenessCommission") val dqCompletenessCommission: DQReportElement?,
)

data class DQReportElement(
    val nameOfMeasure: List<CharacterString>?,
    val measureIdentification: CharacterString?,
    val measureDescription: CharacterString?,
    val evaluationMethodType: CharacterString?,
    val evaluationMethodDescription: CharacterString?,
    val evaluationProcedure: CharacterString?,
    val dateTime: List<CharacterString>?,
    val result: DQResult? // [1..2]
)

data class DQResult(
    @JacksonXmlProperty(localName = "DQ_ConformanceResult") val dqConformanceResult: DQConformanceResult?,
    @JacksonXmlProperty(localName = "DQ_QuantitativeResult") val dqQuantitativeResult: DQQuantitativeResult?
)

data class DQQuantitativeResult(
    val valueType: ValueType?,
    val valueUnit: ValueUnit,
    val errorStatistic: CharacterString?,
    val value: List<Record>
)

data class ValueUnit(
    @JacksonXmlProperty(localName = "UnitDefinition") val unitDefinition: UnitDefinition?
)

data class UnitDefinition(
    val name: String?,
    val quantityType: String?,
    val catalogSymbol: String?
)

data class Record(
    @JacksonXmlProperty(localName = "Record") val value: String?
)
data class RecordAsCharacterString(
    @JacksonXmlProperty(localName = "Record") val value: CharacterString?
)

data class ValueType(
    @JacksonXmlProperty(localName = "RecordType") val recordType: String?
)

data class DQConformanceResult(
    val specification: Citation,
    val explanation: CharacterString,
    val pass: MDBoolean
)

data class MDBoolean(
    @JacksonXmlProperty(localName = "Boolean") val boolean: BooleanValue?
)

data class BooleanValue(
    @JacksonXmlProperty(isAttribute = true) var nilReason: String? = null,
) {
    @JacksonXmlText
    val value: Boolean? = null
}

data class Scope(
    @JacksonXmlProperty(localName = "DQ_Scope") val dqScope: DQScope?
)

data class DQScope(
    val level: ScopeCode,
    val extent: EXExtentOrig?,
    val levelDescription: List<ScopeDescription>?,
)

data class ScopeDescription(
    @JacksonXmlProperty(localName = "MD_ScopeDescription") val mdScopeDescription: MDScopeDescription?
)

data class MDScopeDescription(
    val attributes: List<CharacterString>?,
    val features: List<CharacterString>?,
    val featureInstances: List<CharacterString>?,
    val attributeInstances: List<CharacterString>?,
    val dataset: CharacterString?,
    val other: CharacterString?
)

data class PortrayalCatalogueInfo(
    @JacksonXmlProperty(localName = "MD_PortrayalCatalogueReference") val mdPortrayalCatalogueInfo: MDPortrayalCatalogueInfo?
)

data class MDPortrayalCatalogueInfo(
    val portrayalCatalogueCitation: List<Citation>
)
data class ContentInfo(
    @JacksonXmlProperty(localName = "MD_FeatureCatalogueDescription") val mdFeatureCatalogueDescription: MDFeatureCatalogueDescription?
)

data class MDFeatureCatalogueDescription(
    val complianceCode: CharacterString?,
    val language: List<CharacterString>?,
    val includedWithDataset: CharacterString,
    val featureTypes: List<LocalName>?,
    val featureCatalogueCitation: List<Citation>
)