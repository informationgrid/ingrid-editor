/**
 * ==================================================
 * Copyright (C) 2014-2023 wemove digital solutions GmbH
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
 * Exception signaling an illegal file name. The HTTP status code is 418.
 */
public class IllegalNameException extends ValidationException {

    private static final int STATUS_CODE = 418;

    private static final long serialVersionUID = 1L;
    private static final String INVALID_ERROR_REASON = "errorReason";
    private static final String INVALID_PART_KEY = "invalidPart";

    public enum ErrorReason {
        ILLEGAL_CHAR, RESERVED_WORD
    }

    public IllegalNameException(final String message, final String file, final ErrorReason errorReason, final String invalidPart) {
        super(message, file, STATUS_CODE);
        this.data.put(INVALID_ERROR_REASON, errorReason);
        this.data.put(INVALID_PART_KEY, invalidPart);
    }

    /**
     * Get the error reason
     * @return ErrorReason
     */
    public ErrorReason getErrorType() {
        return (ErrorReason)this.data.get(INVALID_ERROR_REASON);
    }

    /**
     * Get the invalid part of the file name
     * @return String
     */
    public String getLimitType() {
        return (String)this.data.get(INVALID_PART_KEY);
    }
}
