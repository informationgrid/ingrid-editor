package de.ingrid.ige.api;

import com.fasterxml.jackson.databind.JsonNode;

public interface IgeImporter {

	/**
	 * Execute the import for a given data string.
	 * @param data contains the file content which shall be imported
	 * @return the transformed content of the file in the destination json format
	 */
	JsonNode run(Object data);

	/**
	 * Check if a given file can be handled by this importer. This is needed to automatically determine which importer
	 * can be used for a given input file without explicitly defining the type.
	 *
	 * @param contentType is the file type
	 * @param fileContent is the content of the file as a simple string
	 * @return true if this importer can handle this file, otherwise false
	 */
	boolean canHandleImportFile(String contentType, String fileContent);

	String getName();
}
