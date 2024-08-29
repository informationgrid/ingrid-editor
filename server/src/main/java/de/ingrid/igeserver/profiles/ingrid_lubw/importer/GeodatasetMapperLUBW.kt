/**
 * ==================================================
 * Copyright (C) 2024 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_lubw.importer

import de.ingrid.igeserver.exports.iso.MDDataIdentification
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.iso19139.IsoImportData

class GeodatasetMapperLUBW(isoData: IsoImportData) : GeodatasetMapper(isoData) {

    override fun getKeywords(): List<String> = super.getKeywords().filterNot { it.startsWith("oac: ") }

    fun getOAC(): String? {
        return metadata.identificationInfo[0].identificationInfo?.descriptiveKeywords
            ?.flatMap { it.keywords?.keyword?.mapNotNull { it.value } ?: emptyList() }
            ?.find { it.startsWith("oac: ") }
            ?.removePrefix("oac: ")
    }

    fun getEnvironmentDescription(): String? = (metadata.identificationInfo[0].identificationInfo as MDDataIdentification).environmentDescription?.value
}
