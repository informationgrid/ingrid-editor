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
package de.ingrid.igeserver.api

import de.ingrid.igeserver.ClientException
import org.springframework.http.HttpStatus

open class NotFoundException : ClientException {

    protected constructor(statusCode: HttpStatus, errorCode: String, errorText: String, data: Map<String, Any?>? = null, cause: Throwable? = null) :
        super(statusCode, errorCode, errorText, data, cause)

    companion object {
        val STATUS_CODE = HttpStatus.NOT_FOUND

        private const val ERROR_CODE_MISSING_RESOURCE = "RESOURCE_NOT_FOUND"
        private const val ERROR_TEXT_MISSING_RESOURCE = "Resource of type '\${resourceType}' with id '\${resourceId}' is missing."
        private const val ERROR_TEXT_MISSING_HASH = "No Resource of found for hash '\${hash}'."

        private const val ERROR_CODE_MISSING_USER_CATALOG = "CATALOG_NOT_FOUND"
        private const val ERROR_TEXT_MISSING_USER_CATALOG = "The user '\${user}' is not assigned to any catalog."

        private const val ERROR_CODE_MISSING_PUBLISHED_VERSION = "PUBLISHED_VERSION_NOT_FOUND"
        private const val ERROR_TEXT_MISSING_PUBLISHED_VERSION = "Published version of document '\${resourceId}' is missing."

        private const val ERROR_CODE_MISSING_PROFILE = "PROFILE_NOT_FOUND"
        private const val ERROR_TEXT_MISSING_PROFILE = "Profile with ID '\${id}' was not found. Has the profile been activated?"

        /**
         * Factory method for missing resource
         */
        fun withMissingResource(resourceId: String, resourceType: String?, cause: Throwable? = null): NotFoundException {
            return NotFoundException(
                STATUS_CODE,
                ERROR_CODE_MISSING_RESOURCE,
                ERROR_TEXT_MISSING_RESOURCE,
                mapOf("resourceId" to resourceId, "resourceType" to resourceType),
                cause,
            )
        }

        /**
         * Factory method for missing hash
         */
        fun withMissingHash(hash: String, cause: Throwable? = null): NotFoundException {
            return NotFoundException(
                STATUS_CODE,
                ERROR_CODE_MISSING_RESOURCE,
                ERROR_TEXT_MISSING_HASH,
                mapOf("hash" to hash),
                cause,
            )
        }

        /**
         * Factory method for missing catalog for user
         */
        fun withMissingUserCatalog(user: String, cause: Throwable? = null): NotFoundException {
            return NotFoundException(
                STATUS_CODE,
                ERROR_CODE_MISSING_USER_CATALOG,
                ERROR_TEXT_MISSING_USER_CATALOG,
                mapOf("user" to user),
                cause,
            )
        }

        /**
         * Factory method for missing published version of a document
         */
        fun withMissingPublishedVersion(resourceId: String, cause: Throwable? = null): NotFoundException {
            return NotFoundException(
                STATUS_CODE,
                ERROR_CODE_MISSING_PUBLISHED_VERSION,
                ERROR_TEXT_MISSING_PUBLISHED_VERSION,
                mapOf("resourceId" to resourceId),
                cause,
            )
        }

        /**
         * Factory method for missing published version of a document
         */
        fun withMissingProfile(profileId: String, cause: Throwable? = null): NotFoundException {
            return NotFoundException(
                STATUS_CODE,
                ERROR_CODE_MISSING_PROFILE,
                ERROR_TEXT_MISSING_PROFILE,
                mapOf("id" to profileId),
                cause,
            )
        }
    }
}
