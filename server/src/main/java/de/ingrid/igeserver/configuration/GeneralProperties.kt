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

import org.springframework.boot.context.properties.ConfigurationProperties
import org.springframework.boot.context.properties.bind.Name

@ConfigurationProperties("app")
data class GeneralProperties(
    val uuid: String,
    val enableCsrf: Boolean,
    val enableCors: Boolean,
    val enableHttps: Boolean,
    val markInsteadOfDelete: Boolean,
    @Name("host")
    val appUrl: String,
    val externalHelp: String?,
    val instanceId: String = "ige-ng",
    val indexPageSize: Int = 100,
    val openAIHost: String,
    val openAIToken: String? = null,
    val openAIModel: String,
    val actuatorPermitAll: Boolean = false,
    val sessionTimeout: Int = 1800,
    val indexPrefix: String? = null,
)
