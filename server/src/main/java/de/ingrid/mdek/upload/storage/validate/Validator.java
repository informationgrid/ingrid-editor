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

import java.nio.file.Path;
import java.util.List;
import java.util.Map;

/**
 * Validator instances are used to validate files before adding them to the storage
 */
public interface Validator {
    /**
     * Initialization method called with configuration values
     * @param configuration
     * @throws IllegalArgumentException
     */
    void initialize(Map<String, String> configuration) throws IllegalArgumentException;

    /**
     * Validate the path, file and data
     * NOTE: Since this method could be called in different stages of the upload process one or more parameters might be null.
     * E.g. in an early stage only the file path and name could be validated while the file data is still unknown.
     * @param path The path where the file will be placed finally
     * @param file The file name
     * @param size The size of the file in bytes (if data is not empty, this parameter should be ignored and the actual size of data should be used)
     * @param data The path pointing to the uploaded file content (is not necessarily equal to path + file)
     * @param isArchiveContent True, if the file was part of an archive that was extracted in the upload process
     */
    void validate(final String path, final String file, final long size, final long currentSize, final Path data, final boolean isArchiveContent) throws ValidationException;
}
