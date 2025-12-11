/*
 * ==================================================
 * Copyright (C) 2024-2025 wemove digital solutions GmbH
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
package de.ingrid.igeserver.profiles.ingrid_baw

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("profile.baw")
data class BawProperties(
    var domainWhitelist: List<String> = listOf(
        "baugrund-daten.baw.de",
        "dl.datenrepository.baw.de",
        "gst-umschlagstellen.baw.de",
        "henry.baw.de",
        "insel.baw.de",
        "izw.baw.de",
        "mdi-de.baw.de",
        "mdi-dienste.baw.de",
        "wiki.baw.de",
        "www.baw.de",
    ),
)
