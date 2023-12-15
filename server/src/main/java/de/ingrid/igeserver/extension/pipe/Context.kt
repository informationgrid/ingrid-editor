/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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
package de.ingrid.igeserver.extension.pipe

import java.security.Principal

/**
 * Interface for contexts providing or collecting additional information when running the filters in a pipe
 */
interface Context {

    /**
     * Name of the profile to which the pipe payload belongs, used to select matching filters
     *
     * NOTE Null means *no profile*, which means that only filters matching *all profiles* will be active
     */
    val profile: String
    val parentProfile: String?

    /**
     * The catalog the operation is to be executed
     */
    val catalogId: String

    val principal: Principal?

    /**
     * Properties holding additional information that could also be shared between filters
     *
     * NOTE Due to the dynamic configuration of pipes, filters should not make any assumptions
     * about other filters setting specific properties.
     */
    val properties: Map<String, Any?>

    /**
     * Add a message to the context
     */
    fun addMessage(msg: Message)

    /**
     * Remove all messages
     */
    fun clearMessages()

    /**
     * Get the message iterator
     */
    fun messages(): Iterable<Message>
}
