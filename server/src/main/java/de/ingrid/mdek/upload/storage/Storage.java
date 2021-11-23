/*-
 * **************************************************-
 * InGrid Portal MDEK Application
 * ==================================================
 * Copyright (C) 2014 - 2021 wemove digital solutions GmbH
 * ==================================================
 * Licensed under the EUPL, Version 1.1 or – as soon they will be
 * approved by the European Commission - subsequent versions of the
 * EUPL (the "Licence");
 *
 * You may not use this work except in compliance with the Licence.
 * You may obtain a copy of the Licence at:
 *
 * http://ec.europa.eu/idabc/eupl5
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the Licence is distributed on an "AS IS" basis,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the Licence for the specific language governing permissions and
 * limitations under the Licence.
 * **************************************************#
 */
package de.ingrid.mdek.upload.storage;

import de.ingrid.mdek.upload.ValidationException;
import de.ingrid.mdek.upload.storage.impl.FileSystemItem;

import java.io.IOException;
import java.io.InputStream;
import java.util.List;

/**
 * Storage defines the interface for classes, that are responsible for storing and retrieving files.
 */
public interface Storage {
    /**
     * Check if a file exists
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file The file
     * @return boolean
     */
    boolean exists(String catalog, String userID, String datasetID, String file);

    /**
     * Check if a file has a valid name
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file The file
     * @param size The size
     * @throws ValidationException
     */
    void validate(String catalog, String userID, String datasetID, String file, final long size) throws ValidationException;

    /**
     * Get information about a file
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file The file
     * @return StorageItem
     * @throws IOException
     */
    StorageItem getInfo(String catalog, String userID, String datasetID, String file) throws IOException;

    /**
     * Get the content of a file
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file The file
     * @return InputStream
     * @throws IOException
     */
    InputStream read(String catalog, String userID, String datasetID, String file) throws IOException;

    /**
     * Write data to a file in a path and extract archives contained in data
     *
     * @param catalog The current catalog
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file The file
     * @param data The data
     * @param size The size of the file in bytes (used to verify)
     * @param replace Boolean indicating whether to replace an existing file or not
     * @return StorageItem[] The list of created files
     * @throws IOException
     */
    StorageItem[] write(String catalog, String userID, String datasetID, String file, InputStream data, Long size, boolean replace) throws IOException;

    /**
     * Write a file part
     *
     * @param id The id of the file
     * @param index The index of the part
     * @param data The data
     * @param size The size of the part in bytes (used to verify)
     * @throws IOException
     */
    void writePart(String id, Integer index, InputStream data, Long size) throws IOException;

    /**
     * Combine all parts belonging to an id to the final file
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file The file
     * @param id The id of the file
     * @param size The size of the file in bytes (used to verify)
     * @param replace Boolean indicating whether to replace an existing file or not
     * @return StorageItem[] The list of created files
     * @throws IOException
     */
    StorageItem[] combineParts(String catalog, String userID, String datasetID, String file, String id, Integer totalParts, Long size, boolean replace) throws IOException;

    /**
     * Delete a file
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file The file
     * @throws IOException
     */
    void delete(String catalog, String userID, String datasetID, String file) throws IOException;

    /**
     * Archive a file
     *
     * @param datasetID The UUID of the dataset
     * @param file
     * @throws IOException
     */
    void archive(String catalog, String datasetID, String file) throws IOException;

    /**
     * Restore a file
     *
     * @param datasetID The UUID of the dataset
     * @param file
     * @throws IOException
     */
    void restore(String catalog, String datasetID, String file) throws IOException;

    /**
     * Restore a file
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param file
     * @throws IOException
     */
    StorageItem[] extract(String catalog, String userID, String datasetID, String file, boolean replace) throws IOException;

    /**
     * Execute cleanup tasks, that are necessary to maintain this storage
     * NOTE: This method does not delete any files that might still be referenced
     *
     * @throws IOException
     */
    void cleanup() throws IOException;

    /**
     * transfer files from unsaved to unpublished state
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @param referencedFiles Files referenced in the Dataset
     * @throws IOException
     */
    void saveDataset(String catalog, String userID, String datasetID, List<String> referencedFiles) throws IOException;

    /**
     * transfer files from unpublished to published state
     *
     * @param datasetID The UUID of the dataset
     * @param referencedFiles Files referenced in the Dataset
     * @throws IOException
     */
    void publishDataset(String catalog, String datasetID, List<String> referencedFiles) throws IOException;

    /**
     * transfer files from published to unpublished state
     *
     * @param datasetID The UUID of the dataset
     * @param referencedFiles Files referenced in the unpublished Dataset
     * @throws IOException
     */
    void unpublishDataset(String catalog, String datasetID, List<String> referencedFiles) throws IOException;

    /**
     * remove files from unpublished state
     *
     * @param datasetID The UUID of the dataset
     * @throws IOException
     */
    void discardUnpublished(String catalog, String datasetID) throws IOException;

    /**
     * remove files from unsaved state
     *
     * @param userID The ID of the current User, relevant for unsaved Scope
     * @param datasetID The UUID of the dataset
     * @throws IOException
     */
    void discardUnsaved(String catalog, String userID, String datasetID) throws IOException;
}
