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
package de.ingrid.igeserver.utils

import de.ingrid.igeserver.services.CatalogProfile
import org.springframework.stereotype.Service

@Service
class ReferenceHandlerFactory(val referenceHandlers: List<ReferenceHandler>) {
    fun get(profile: CatalogProfile): ReferenceHandler? {
        return referenceHandlers.find { it.getProfile() == profile.identifier || it.getProfile() == profile.parentProfile }
    }
}
