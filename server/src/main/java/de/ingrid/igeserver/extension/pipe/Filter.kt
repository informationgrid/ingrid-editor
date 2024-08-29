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
package de.ingrid.igeserver.extension.pipe

import de.ingrid.igeserver.extension.Extension

/**
 * Interface for filters running inside a pipe
 *
 * A filter is called with the content to be filtered (payload) and a filter context and returns
 * the filtered content. The context is used to collect or provide additional information.
 * Each filter implementation can only operate on a specific payload type (and it's subtypes).
 *
 * NOTE Exceptions thrown by a filter prevent succeeding filters in the pipe from running.
 * This allows filters to reject further processing of the payload but also implies that
 * non-fatal exceptions should be handled by the filter itself.
 */
interface Filter<T : Payload> : Extension, (T, Context) -> T {

    override val id: String
        get() = this::class.qualifiedName ?: this::class.toString()
}
