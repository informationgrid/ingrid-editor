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
 * Exception signaling an illegal file or directory size. The HTTP status code is 420.
 */
public class IllegalSizeException extends ValidationException {

    private static final int STATUS_CODE = 420;

    private static final long serialVersionUID = 1L;
    private static final String LIMIT_TYPE_KEY = "limitType";
    private static final String MAX_SIZE_KEY = "maxSize";
    private static final String USED_SIZE_KEY = "usedSize";

    public enum LimitType {
        FILE, DIRECTORY
    }

    public IllegalSizeException(final String message, final String file, final LimitType limitType, final Long maxSize, final Long usedSize) {
        super(message, file, STATUS_CODE);
        this.data.put(LIMIT_TYPE_KEY, limitType);
        this.data.put(MAX_SIZE_KEY, maxSize);
        this.data.put(USED_SIZE_KEY, usedSize);
    }

    /**
     * Get the maximum size that was exceeded
     * @return Long
     */
    public LimitType getLimitType() {
        return (LimitType)this.data.get(LIMIT_TYPE_KEY);
    }

    /**
     * Get the maximum size that was exceeded
     * @return Long
     */
    public Long getMaxSize() {
        return (Long)this.data.get(MAX_SIZE_KEY);
    }

    /**
     * Get the used size (only valid when limitType is directory)
     * @return Long
     */
    public Long getUsedSize() {
        return (Long)this.data.get(USED_SIZE_KEY);
    }
}
