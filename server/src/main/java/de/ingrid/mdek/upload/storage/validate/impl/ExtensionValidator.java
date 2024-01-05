/**
 * ==================================================
 * Copyright (C) 2023-2024 wemove digital solutions GmbH
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
package de.ingrid.mdek.upload.storage.validate.impl;

import de.ingrid.mdek.upload.ValidationException;
import de.ingrid.mdek.upload.storage.validate.InvalidExtensionException;
import de.ingrid.mdek.upload.storage.validate.Validator;

import java.nio.file.Path;
import java.util.Arrays;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Validator implementation that validates the extension of an uploaded file.
 * <p>
 * Required configuration
 * - validExtensions: accepted extensions, all the others are blocked.
 */
public class ExtensionValidator implements Validator {
    private static final String CONFIG_KEY_ALLOWED_EXTENSIONS = "allowedExtensions";

    private String[] allowedExtensions;

    @Override public void initialize(Map<String, String> configuration) throws IllegalArgumentException {
        // if parameter is active make sure it is set in the config
        if (!configuration.containsKey( CONFIG_KEY_ALLOWED_EXTENSIONS )) {
            throw new IllegalArgumentException( "Configuration value '" + CONFIG_KEY_ALLOWED_EXTENSIONS + "' is required." );
        }

        // read from config-file the allowed extensions parameter
        try {
            this.allowedExtensions = (configuration.get( CONFIG_KEY_ALLOWED_EXTENSIONS )).split( "," );
        } catch (Exception e) {
            throw new IllegalArgumentException( "Configuration value" + CONFIG_KEY_ALLOWED_EXTENSIONS + " is not in a valid format.", e );
        }

        // if no extension is specified, throw error
        if (this.allowedExtensions[0].isEmpty()) {
            throw new IllegalArgumentException( "Allowed extensions value cannot be empty." );
        }
    }

    @Override public void validate(String path, String file, long size, final long currentSize, Path data, boolean isArchiveContent)
            throws ValidationException {
        Pattern pattern = Pattern.compile( "(.*)\\.(.*)" );
        Matcher matcherFile = pattern.matcher( file );
        String fileExtension = "";

        // match regex to find extension
        if (matcherFile.find()) {
            fileExtension = matcherFile.group( 2 );
        }

        // extension is not allowed
        if (!Arrays.asList( this.allowedExtensions ).contains( fileExtension )) {
            throw new InvalidExtensionException( "The file: " + file + " has an invalid extension.", file,
                    this.allowedExtensions, fileExtension );
        }

    }
}
