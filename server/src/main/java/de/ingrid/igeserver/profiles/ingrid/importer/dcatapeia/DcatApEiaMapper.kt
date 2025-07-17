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
package de.ingrid.igeserver.profiles.ingrid.importer.dcatapeia

import com.wemove.dcatparser.dcatapde.model.dcat.Dataset

class DcatApEiaMapper(
    var model: Dataset,
    var docUuid: String?,
) {
    @Suppress("PropertyName")
    val _type: String = "UvpApprovalProcedureDoc"

    @Suppress("PropertyName")
    val _uuid: String? = docUuid

    val title = model.title.firstOrNull()
    val description = model.description.firstOrNull()
}
