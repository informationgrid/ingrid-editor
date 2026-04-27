/*
 * ==================================================
 * Copyright (C) 2025-2026 wemove digital solutions GmbH
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

/**
 * Adds the specified prefix to the string if it does not already start with the prefix.
 *
 * @param prefix The prefix to add to the string if it is not already present.
 * @return The original string if it starts with the prefix, otherwise the string with the prefix added.
 */
fun String.prefixIfNot(prefix: String) = if (this.startsWith(prefix)) this else "$prefix$this"

/**
 * Appends the specified suffix to the string if it does not already end with it.
 *
 * @param suffix The suffix to be appended if not already present.
 * @return The original string if it ends with the specified suffix, otherwise the string with the suffix appended.
 */
fun String.suffixIfNot(suffix: String) = if (this.endsWith(suffix)) this else "$this$suffix"

/**
 * Executes the given lambda function if the boolean value is `false`.
 *
 * @param body The lambda function to execute if the boolean evaluates to `false`.
 * @return The result of the lambda function if the boolean is `false`, otherwise `null`.
 */
inline fun <T> Boolean.ifFalse(body: () -> T?): T? = if (!this) body() else null
