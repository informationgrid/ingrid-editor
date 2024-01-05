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
package de.ingrid.igeserver.extension

/**
 * Interface for extensions that can be registered at extension points
 */
interface Extension {

    /**
     * Identifier of the extension
     */
    val id: String

    /**
     * List of profiles using the extension
     *
     * NOTE Empty array means *all profiles*, null means *no profile* (effectively deactivating the filter).
     * If the array is not empty, the extension should *only* be used for profiles contained in the profile list.
     */
    val profiles: Array<String>?

    /**
     * Check if the extension is used in the given profile
     * @param profileId Name of the profile (null, if unspecified)
     */
    fun usedInProfile(profileId: String?): Boolean {
        return profiles != null // not deactivated
                && (
                    // no profiles specified for extension -> match all given profiles
                    profiles!!.isEmpty() ||
                    // profiles specified for extension -> match only specific profile
                    profiles!!.isNotEmpty() && profileId in profiles!!
                )
    }
}