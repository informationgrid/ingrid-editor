package de.ingrid.igeserver.imports

import com.fasterxml.jackson.databind.JsonNode

interface IgeImporter {

    val typeInfo: ImportTypeInfo

    /**
     * Execute the import for a given data string.
     * @param data contains the file content which shall be imported
     * @return the transformed content of the file in the destination json format
     */
    fun run(catalogId: String, data: Any): JsonNode

    /**
     * Check if a given file can be handled by this importer. This is needed to automatically determine which importer
     * can be used for a given input file without explicitly defining the type.
     *
     * @param contentType is the file type
     * @param fileContent is the content of the file as a simple string
     * @return true if this importer can handle this file, otherwise false
     */
    fun canHandleImportFile(contentType: String, fileContent: String): Boolean

}