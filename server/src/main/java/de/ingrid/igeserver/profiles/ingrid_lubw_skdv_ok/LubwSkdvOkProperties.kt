/**
 * ==================================================
 * Copyright (C) 2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_lubw_skdv_ok

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("profile.ingrid-lubw-skdv-ok")
data class LubwSkdvOkProperties(
    val publishEmailTo: String = "RIPS-Metadaten@lubw.bwl.de",
    val publishEmailContent: String = """<ul>
        <li>Metadatensatz: {0}</li>
        <li>UUID: {1}</li>
        <li>Fachredakteur: {2}</li>
        <li>Wann: {3}</li>
    </ul>""",
)
