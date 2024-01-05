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
package de.ingrid.mdek.upload;

import de.ingrid.mdek.upload.storage.StorageItem;
import jakarta.ws.rs.WebApplicationException;
import jakarta.ws.rs.core.Response;

import java.util.HashMap;
import java.util.Map;

/**
 * An exception signaling a conflict between a new item and existing items.
 * The data contain the existing item(s) (multiple, if the item is an archive)
 * and an alternative name that may be used to resolve the conflict.
 */
public class ConflictException extends WebApplicationException implements UploadException {

    private static final long serialVersionUID = 1L;

    private Map<String, Object> data = new HashMap<>();

    /**
     * Constructor
     * @param message
     * @param files
     * @param altName
     */
    public ConflictException(String message, StorageItem[] files, String altName) {
        super(message, Response.Status.CONFLICT.getStatusCode());
        this.data.put("files", files);
        this.data.put("alt", altName);
    }

    @Override
    public Map<String, Object> getData() {
        return this.data;
    }
}
