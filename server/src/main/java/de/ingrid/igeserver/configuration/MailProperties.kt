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
package de.ingrid.igeserver.configuration

import org.springframework.boot.context.properties.ConfigurationProperties

@ConfigurationProperties("mail")
data class MailProperties(
    val from: String,
    val subject: String,
    val subjectDatasetWillExpire: String,
    val subjectDatasetIsExpired: String,
    val subjectDeleteUser: String,
    val subjectResetPassword: String,
    val body: String,
    val bodyDeleteUser: String,
    val bodyWithPassword: String,
    val bodyResetPassword: String,
)
