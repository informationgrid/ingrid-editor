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
package de.ingrid.igeserver.profiles.ingrid.importer

import de.ingrid.igeserver.ServerException
import de.ingrid.igeserver.model.KeyValue
import de.ingrid.igeserver.profiles.ingrid.exporter.model.ServiceUrl
import de.ingrid.igeserver.profiles.ingrid.iso639LanguageMapping
import org.apache.logging.log4j.kotlin.logger

open class ApplicationMapper(isoData: IsoImportData) : GeneralMapper(isoData) {

    val log = logger()
    val identificationInfo = metadata.identificationInfo[0].dataIdentificationInfo

    fun getCharacterSet(): KeyValue? {
        val value = identificationInfo?.characterSet?.get(0)?.code?.codeListValue
        val entryId = codeListService.getCodeListEntryId("510", value, "iso")
        if (entryId == null) {
            log.warn("Could not map CharacterSet: $value")
            return null
        }

        return KeyValue(entryId)
    }

    fun getLanguages(): List<String> {
        return identificationInfo?.language
            ?.mapNotNull { it.code?.codeListValue }
            ?.map {
                iso639LanguageMapping[it]
                    ?: throw ServerException.withReason("Could not map document language key: $it")
            }
            ?: emptyList()
    }

    fun getServiceType(): KeyValue? = null // not supported yet, even in export!

    fun getServiceVersion(): List<KeyValue> = emptyList() // not supported yet, even in export!

    fun getSystemEnvironment(): String = identificationInfo?.environmentDescription?.value ?: ""

    fun getImplementationHistory(): String =
        metadata.dataQualityInfo?.get(0)?.dqDataQuality?.lineage?.liLinage?.processStep?.get(0)?.liProcessStep?.description?.value
            ?: ""

    fun getBaseDataText(): String =
        metadata.dataQualityInfo?.get(0)?.dqDataQuality?.lineage?.liLinage?.source?.get(0)?.liSource?.description?.value
            ?: ""

    fun getExplanation(): String = identificationInfo?.supplementalInformation?.value ?: ""

    fun getServiceUrls(): List<ServiceUrl> = metadata.distributionInfo?.mdDistribution?.transferOptions
        ?.flatMap { transferOption ->
            transferOption.mdDigitalTransferOptions?.onLine
                ?.filter { it.ciOnlineResource?.function?.code?.codeListValue == "information" }
                ?.mapNotNull { it.ciOnlineResource }
                ?.map { resource ->
                    ServiceUrl(
                        resource.name?.value ?: "",
                        resource.linkage.url ?: "",
                        resource.description?.value
                    )
                } ?: emptyList()
        } ?: emptyList()
}
