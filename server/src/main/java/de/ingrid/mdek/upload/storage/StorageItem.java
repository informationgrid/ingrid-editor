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
package de.ingrid.mdek.upload.storage;

import com.fasterxml.jackson.annotation.JsonIgnore;

import java.time.LocalDateTime;

/**
 * StorageItem represents an item in the storage.
 */
public interface StorageItem {
    /**
     * Get the path
     * @return String
     */
    String getPath();

    /**
     * Get the file
     * @return String
     */
    String getFile();

    /**
     * Get the URI as combination of path and file
     * NOTE: URIs are URL-encoded and use the forward slash as separator for path parts
     * @return String
     */
    String getUri();

    /**
     * Get the type
     * @return String
     */
    String getType();

    /**
     * Get the size
     * @return long
     */
    long getSize();

    /**
     * Get the last modification date
     * @return LocalDateTime
     */
    LocalDateTime getLastModifiedDate();

    /**
     * Indicates if the file is archived
     * @return boolean
     */
    boolean isArchived();

    /**
     * Get an incremented name to be used in case of conflict
     * @return String
     */
    @JsonIgnore
    String getNextName();

    /**
     * Get the relative Path
     * @return String
     */
    @JsonIgnore
    String getRelativePath();
}
