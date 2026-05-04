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
package de.ingrid.igeserver.configuration

import org.springframework.stereotype.Component
import java.util.concurrent.ConcurrentHashMap

@Component
class StaleAuthoritiesRegistry {
    private val staleLogins = ConcurrentHashMap.newKeySet<String>()

    fun markStale(login: String) {
        staleLogins.add(login)
    }

    /** Returns true and removes the login if it was stale, false otherwise. Atomic. */
    fun checkAndClear(login: String): Boolean = staleLogins.remove(login)
}
