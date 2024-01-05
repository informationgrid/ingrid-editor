/**
 * ==================================================
 * Copyright (C) 2014-2024 wemove digital solutions GmbH
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
package de.ingrid.mdek.upload.storage.validate;

import de.ingrid.mdek.upload.ValidationException;

/**
 * Exception signaling an illegal file extension. The HTTP status code is 422 (unprocessable entity).
 */
public class InvalidExtensionException extends ValidationException {
    private static final int STATUS_CODE = 422;

    private static final long serialVersionUID = 1L;

    private static final String INVALID_EXTENSION_KEY = "invalidExtension";
    private static final String ALLOWED_EXTENSIONS_KEY = "allowedExtensions";

    public InvalidExtensionException(final String message, final String file, final String[] allowedExtensions, final String invalidExtension) {
        super( message, file, STATUS_CODE );
        this.data.put( INVALID_EXTENSION_KEY, invalidExtension );
        this.data.put( ALLOWED_EXTENSIONS_KEY, allowedExtensions );
    }

    /**
     * Get the invalid extension
     *
     * @return ErrorReason
     */
    public String getInvalidExtension() {
        return (String) this.data.get( INVALID_EXTENSION_KEY );
    }

    /**
     * Get the allowed extension(s)
     * Add a white space after every comma to better format the message
     *
     * @return ErrorReason
     */
    public String getAllowedExtensions() {
        return (String) this.data.get( ALLOWED_EXTENSIONS_KEY );
    }

}
