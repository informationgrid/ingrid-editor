/**
 * ==================================================
 * Copyright (C) 2023-2025 wemove digital solutions GmbH
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

    override val extraContent: String by lazy { getBwastrIdfSection(this) + getSoftwareExtraContent() }

    override fun getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs() = super.getServiceUrlsAndCoupledServiceAndAtomAndExternalRefs() + getLfsReferences(this)

    fun getServiceVersionXML(): String {
        val versions = doc.data.getPath("serviceVersion")?.mapNotNull { it.mapToKeyValue()?.value } ?: emptyList()
        return """
            <Version>
                ${versions.joinToString("\n") { "<version>$it</version>" }}
            </Version>
        """.trimIndent()
    }

    fun getProgrammierspracheXML(): String {
        val languages = doc.data.getPath("programmingLanguages")?.mapNotNull { codelists.getValue("3950030", it.mapToKeyValue()) } ?: emptyList()
        return """
            <Programmiersprache>
                ${languages.joinToString("\n") { "<programmiersprache>$it</programmiersprache>" }}
            </Programmiersprache>
        """
    }

    fun getSoftwareExtraContent(): String = """
          <software>
            <einsatzzweck>${doc.data.getString("purpose")}</einsatzzweck>
            <Nutzerkreis>
              <baw>
                <gco:Boolean>${doc.data.getBoolean("userGroup.baw")}</gco:Boolean>
              </baw>
              <wsv>
                <gco:Boolean>${doc.data.getBoolean("userGroup.wsv")}</gco:Boolean>
              </wsv>
              <extern>
                <gco:Boolean>thrrth</gco:Boolean>
              </extern>
              <anmerkungen>${doc.data.getString("userGroupNotes")}</anmerkungen>
            </Nutzerkreis>
            <ProduktiverEinsatz>
              <wsvAuftrag>
                <gco:Boolean>${doc.data.getBoolean("productiveUse.wsv")}</gco:Boolean>
              </wsvAuftrag>
              <fUndE>
                <gco:Boolean>${doc.data.getBoolean("productiveUse.fue")}</gco:Boolean>
              </fUndE>
              <andere>
                <gco:Boolean>${doc.data.getBoolean("productiveUse.other")}</gco:Boolean>
              </andere>
              <anmerkungen>${doc.data.getString("productiveUseNotes")}</anmerkungen>
            </ProduktiverEinsatz>
            ${getServiceVersionXML()}
            <ErgaenzungsModul>
              <ergaenzungsModul>
                <gco:Boolean>${doc.data.getBoolean("hasSupplementaryModule")}</gco:Boolean>
              </ergaenzungsModul>
              <ergaenzteSoftware>${doc.data.getString("nameOfSoftware")}</ergaenzteSoftware>
            </ErgaenzungsModul>
            <Betriebssystem>
              <windows>
                <gco:Boolean>${doc.data.getBoolean("operatingSystem.windows")}</gco:Boolean>
              </windows>
              <linux>
                <gco:Boolean>${doc.data.getBoolean("operatingSystem.linux")}</gco:Boolean>
              </linux>
              <anmerkungen>${doc.data.getString("operatingSystemNotes")}</anmerkungen>
            </Betriebssystem>
            ${getProgrammierspracheXML()}
            <Erstellungsvertrag>
              <vertragsNummer/>
              <datum/>
            </Erstellungsvertrag>
            <Supportvertrag>
              <vertragsNummer/>
              <datum/>
              <anmerkungen/>
            </Supportvertrag>
            <Installationsort>
              <lokal>
                <gco:Boolean>${doc.data.getBoolean("installation.local")}</gco:Boolean>
              </lokal>
              <HLR>
                <hlr>
                  <gco:Boolean>${doc.data.getBoolean("installation.hlr")}</gco:Boolean>
                </hlr>
                <hlrName>${doc.data.getPath("hlrNames")?.mapNotNull { codelists.getValue("3950033", it.mapToKeyValue()) }?.joinToString { ", " }}</hlrName>
              </HLR>
              <Server>
                <server>
                  <gco:Boolean>${doc.data.getBoolean("installation.server")}</gco:Boolean>
                </server>
                <servername>${doc.data.getPath("serverNames")?.mapNotNull { if (it.isNull) null else it.asText() }?.joinToString { ", " }}</servername>
              </Server>
            </Installationsort>
            <installationsMethode>${ codelists.getValue("3950032",doc.data.getPath("installationWith")?.mapToKeyValue())}</installationsMethode>
            <QuellCodeRechte>
              <baw>
                <gco:Boolean>${doc.data.getBoolean("resource.hasSourceRights")}</gco:Boolean>
              </baw>
              <anmerkungen>${doc.data.getString("resource.sourceRightsNotes")}</anmerkungen>
            </QuellCodeRechte>
            <NutzungsRechte>
              <dritte>
                <gco:Boolean>${doc.data.getBoolean("resource.hasUsageRights")}</gco:Boolean>
              </dritte>
              <anmerkungen>${doc.data.getString("resource.usageRightsNotes")}</anmerkungen>
            </NutzungsRechte>
          </software>
    """.trimIndent()
}
