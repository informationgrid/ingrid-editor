/**
 * ==================================================
 * Copyright (C) 2023 wemove digital solutions GmbH
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