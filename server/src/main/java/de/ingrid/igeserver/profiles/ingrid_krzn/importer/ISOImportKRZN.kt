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
package de.ingrid.igeserver.profiles.ingrid_krzn.importer

import de.ingrid.igeserver.exports.iso.Metadata
import de.ingrid.igeserver.profiles.ingrid.importer.GeodatasetMapper
import de.ingrid.igeserver.profiles.ingrid.importer.ISOImportProfile
import de.ingrid.igeserver.profiles.ingrid.importer.ImportProfileData
import de.ingrid.igeserver.services.CodelistHandler
import de.ingrid.igeserver.services.DocumentService
import org.springframework.context.annotation.Lazy
import org.springframework.stereotype.Service

@Service
class ISOImportKRZN(val codelistHandler: CodelistHandler, @Lazy val documentService: DocumentService) : ISOImportProfile {
    override fun handle(catalogId: String, data: Metadata): ImportProfileData? {

        return when (data.hierarchyLevel?.get(0)?.scopeCode?.codeListValue) {
            "dataset" -> {
                ImportProfileData(
                    "imports/ingrid-krzn/geodataset.jte",
                    GeodatasetMapper(data, codelistHandler, catalogId, documentService)
                )
            }

            else -> null
        }
    }

}