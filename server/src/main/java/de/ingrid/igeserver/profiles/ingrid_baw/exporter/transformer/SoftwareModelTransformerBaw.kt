/*
 * ==================================================
 * Copyright (C) 2023-2026 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformer

import de.ingrid.igeserver.exporter.model.GeographicElement
import de.ingrid.igeserver.profiles.ingrid.exporter.InformationSystemModelTransformer
import de.ingrid.igeserver.profiles.ingrid.exporter.TransformerConfig
import de.ingrid.igeserver.profiles.ingrid.exporter.model.Thesaurus
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBawKeywords
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBwastrGeographicElements
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getBwastrIdfSection
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getLfsReferences
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getParentIdentifierBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.getSubsoilKeywords
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.mapDocumentTypeBaw
import de.ingrid.igeserver.profiles.ingrid_baw.exporter.transformUrlForDatenrepository
import de.ingrid.igeserver.utils.getBoolean
import de.ingrid.igeserver.utils.getPath
import de.ingrid.igeserver.utils.getString
import de.ingrid.igeserver.utils.mapToKeyValue

open class SoftwareModelTransformerBaw(transformerConfig: TransformerConfig) : InformationSystemModelTransformer(transformerConfig) {

    fun forRepository() = transformerConfig.tags.contains("forRepository")
    override val uomMeter = "m"
    override fun transformUrl(url: String?): String? = if (forRepository()) transformUrlForDatenrepository(url) else super.transformUrl(url)
    override fun mapDocumentType(type: String): String = mapDocumentTypeBaw(type) ?: super.mapDocumentType(type)
    override val linkToVerticalCRS = true
    override fun getParentIdentifier(): String? = getParentIdentifierBaw(this)
    override fun getGeographicElements(): List<GeographicElement> = super.getGeographicElements() + getBwastrGeographicElements(this)
    override fun getKeywordsAsList(): List<String> = super.getKeywordsAsList() + getBawKeywords(this).keywords.mapNotNull { it.name } + getSubsoilKeywords(this).keywords.mapNotNull { it.name }

    override fun getDescriptiveKeywords(): List<Thesaurus> = super.getDescriptiveKeywords() + getBawKeywords(this) + getSubsoilKeywords(this)

    override val spatialSystems =
        super.spatialSystems + (
            (doc.data.getPath("spatial.verticalSpatialSystems"))?.mapNotNull { it.mapToKeyValue() }
                ?.map {
                    mapToCharacterStringModel(
                        "verticalSpatialSystems",
                        it,
                    )
                } ?: emptyList()
            )

    override fun getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs() = super.getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs() + getLfsReferences(this)

    override val extraContent: String by lazy { getBwastrIdfSection(this) }

    val softwarePurpose = doc.data.getString("purpose")
    val installationMethod = codelists.getValue("3950032", doc.data.getPath("installationWith")?.mapToKeyValue())

    val userGroupBaw = doc.data.getBoolean("userGroup.baw") ?: false
    val userGroupWsv = doc.data.getBoolean("userGroup.wsv") ?: false
    val userGroupExtern = doc.data.getBoolean("userGroup.extern") ?: false
    val userGroupNotes = doc.data.getString("userGroupNotes")

    val productiveUseWsv = doc.data.getBoolean("productiveUse.wsv") ?: false
    val productiveUseFue = doc.data.getBoolean("productiveUse.fue") ?: false
    val productiveUseOther = doc.data.getBoolean("productiveUse.other") ?: false
    val productiveUseNotes = doc.data.getString("productiveUseNotes")

    val hasSupplementaryModule = doc.data.getBoolean("hasSupplementaryModule") ?: false
    val nameOfSoftware = doc.data.getString("nameOfSoftware")
    val operatingSystemWindows = doc.data.getBoolean("operatingSystem.windows") ?: false
    val operatingSystemLinux = doc.data.getBoolean("operatingSystem.linux") ?: false
    val operatingSystemNotes = doc.data.getString("operatingSystemNotes")

    val installationLocal = doc.data.getBoolean("installation.local") ?: false
    val installationHlr = doc.data.getBoolean("installation.hlr") ?: false
    val installationServer = doc.data.getBoolean("installation.server") ?: false
    val hlrNames = doc.data.getPath("hlrNames")?.mapNotNull { codelists.getValue("3950033", it.mapToKeyValue()) } ?: emptyList()
    val serverNames = doc.data.getPath("serverNames")?.mapNotNull { if (it.isNull) null else it.asString() } ?: emptyList()

    val serviceVersions = doc.data.getPath("serviceVersion")?.mapNotNull { it.mapToKeyValue()?.value } ?: emptyList()

    val programmingLanguages = doc.data.getPath("programmingLanguage")?.mapNotNull { codelists.getValue("3950030", it.mapToKeyValue()) } ?: emptyList()
    val developmentEnvironment = doc.data.getPath("developmentEnvironment")?.mapNotNull { codelists.getValue("3950031", it.mapToKeyValue()) } ?: emptyList()
    val libraries = doc.data.getPath("libraries")?.mapNotNull { if (it.isNull) null else it.asString() } ?: emptyList()

    val hasSourceRights = doc.data.getBoolean("resource.hasSourceRights") ?: false
    val sourceRightsNotes = doc.data.getString("resource.sourceRightsNotes")
    val hasUsageRights = doc.data.getBoolean("resource.hasUsageRights") ?: false
    val usageRightsNotes = doc.data.getString("resource.usageRightsNotes")
}
