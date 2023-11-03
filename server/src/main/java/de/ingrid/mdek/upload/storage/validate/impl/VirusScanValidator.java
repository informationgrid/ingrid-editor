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
package de.ingrid.mdek.upload.storage.validate.impl;

import de.ingrid.mdek.upload.ValidationException;
import de.ingrid.mdek.upload.storage.validate.Validator;
import de.ingrid.mdek.upload.storage.validate.VirusFoundException;
import de.ingrid.mdek.upload.storage.validate.VirusScanException;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

/**
 * Validator implementation that runs a virus scan on the file.
 *
 * The implementation uses an external command to run the virus scan.
 *
 * Required configuration
 *   - command: External command to be executed. The string *must* contain a %FILE% parameter that will be replaced with the file to scan.
 *   - virusPattern: Regular expression pattern that matches infections reported in the scan command result
 *                   The pattern must contain a capturing group for the virus name (#1) and one for the infected resource (#2)
 *   - cleanPattern: Regular expression pattern applied to the command result that matches, if no virus infection is found
 *
 *   NOTE: If neither virusPattern nor cleanPattern match, an error is assumed and will be logged. Validation does NOT fail in this case.
 */
public class VirusScanValidator implements Validator {

    private static final String CONFIG_KEY_COMMAND       = "command";
    private static final String CONFIG_KEY_VIRUS_PATTERN = "virusPattern";
    private static final String CONFIG_KEY_CLEAN_PATTERN = "cleanPattern";
    private static final String CONFIG_KEY_ERROR_PATTERN = "errorPattern";
    private static final String CONFIG_KEY_TIMEOUT = "timeout";

    private static final String PLACEHOLDER_FILE = "%FILE%";

    private String command;
    private Pattern virusPattern;
    private Pattern cleanPattern;
    private Pattern errorPattern;

    private ExternalCommand scanner = new ExternalCommand();

    private static final Logger log = LogManager.getLogger(VirusScanValidator.class);

    @Override
    public void initialize(final Map<String, String> configuration) throws IllegalArgumentException {
        // check required configuration parameters
        for (final String parameter : new String[] {CONFIG_KEY_COMMAND, CONFIG_KEY_VIRUS_PATTERN, CONFIG_KEY_CLEAN_PATTERN}) {
            if (!configuration.containsKey(parameter)) {
                throw new IllegalArgumentException("Configuration value '"+parameter+"' is required.");
            }
        }

        // Set Timeout
        if(configuration.containsKey(CONFIG_KEY_TIMEOUT)){
            scanner = new ExternalCommand(Integer.parseInt(configuration.get(CONFIG_KEY_TIMEOUT)));
        }

        // command parameter
        final String command = configuration.get(CONFIG_KEY_COMMAND);
        if (!command.contains(PLACEHOLDER_FILE)) {
            throw new IllegalArgumentException("Configuration value 'command' *must* contain a '+PLACEHOLDER_FILE+' substring. The configuration value is: '"+command+"'.");
        }
        this.command = command;

        // pattern parameters
        final String virusPattern = configuration.get(CONFIG_KEY_VIRUS_PATTERN);
        this.virusPattern = Pattern.compile(virusPattern);
        final String cleanPattern = configuration.get(CONFIG_KEY_CLEAN_PATTERN);
        this.cleanPattern = Pattern.compile(cleanPattern);
        final String errorPattern = configuration.get(CONFIG_KEY_ERROR_PATTERN);
        this.errorPattern = Pattern.compile(errorPattern);
    }

    @Override
    public void validate(final String path, final String file, final long size, final long currentSize, final Path data, final boolean isArchiveContent) throws ValidationException {
        if (data == null) {
            return;
        }
        // archive content is scanned before extraction
        if (isArchiveContent) {
            return;
        }

        try {
            // scan file or directory
            final String result = runScan(data);
            if (result == null) {
                throw new CommandExecutionException("Scan returned null");
            }

            // analyze result
            final Matcher virusMatcher = virusPattern.matcher(result);
            final Map<Path, String> virusList = new HashMap<>();
            final Matcher errorMatcher = errorPattern.matcher(result);
            final String scanResult = result;
            boolean scanError = false;

            while (virusMatcher.find()) {
                virusList.put(Paths.get(virusMatcher.group(2)), virusMatcher.group(1));
            }
            while (errorMatcher.find()) {
                scanError = true;
            }

            if (!virusList.isEmpty()) {
                log.warn("Virus found: " + result);
                throw new VirusFoundException("Virus found.", path+"/"+file, scanResult, virusList);
            }
            else if (scanError) {
                log.warn("An error occurred during the scan");
                throw new VirusScanException( "Error during scan.", path+"/"+file, scanResult );
            }
            else if (!cleanPattern.matcher(result).lookingAt()) {
                log.error("Virus scan failed: " + result);
            }
            else {
                if (log.isDebugEnabled()) {
                    log.debug("Scan result: " + result);
                }
            }
        }
        catch (final CommandExecutionException e) {
            log.error("Virus scan failed: ", e);
        }
    }

    /**
     * Scan the given file
     * @param file
     * @return String
     * @throws CommandExecutionException
     */
    private String runScan(final Path file) throws CommandExecutionException {
        final String command = this.command.replace(PLACEHOLDER_FILE, file.toString());
        if (log.isDebugEnabled()) {
            log.debug("Run command: " + command);
        }
        return scanner.execute(command);
    }
}
