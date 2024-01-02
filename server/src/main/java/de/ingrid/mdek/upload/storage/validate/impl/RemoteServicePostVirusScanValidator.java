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
package de.ingrid.mdek.upload.storage.validate.impl;

import de.ingrid.mdek.upload.ValidationException;
import de.ingrid.mdek.upload.storage.validate.Validator;
import de.ingrid.mdek.upload.storage.validate.VirusFoundException;
import org.apache.http.entity.FileEntity;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.HashMap;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.util.EntityUtils;


/**
 * Validator implementation that runs a virus scan via RestAPI with POST-Request.
 * Implemented for Symantec Protection Engine
 *
 * Required configuration
 *   - command: External command to be executed. The string *must* contain a %FILE% parameter that will be replaced with the file to scan.
 *   - virusPattern: Regular expression pattern that matches infections reported in the scan command result
 *                   The pattern must contain a capturing group for the virus name (#1) and one for the infected resource (#2)
 *   - cleanPattern: Regular expression pattern applied to the command result that matches, if no virus infection is found
 *
 *   NOTE: If neither virusPattern nor cleanPattern match, an error is assumed and will be logged. Validation does NOT fail in this case.
 */
public class RemoteServicePostVirusScanValidator implements Validator {

    private static final String CONFIG_KEY_URL       = "url";
    private static final String CONFIG_KEY_VIRUS_PATTERN = "virusPattern";
    private static final String CONFIG_KEY_CLEAN_PATTERN = "cleanPattern";
    private static final String CONFIG_KEY_TIMEOUT = "timeout";

    private static final String PLACEHOLDER_FILE = "%FILE%";

    private String url;
    private Pattern virusPattern;
    private Pattern cleanPattern;

    private ExternalCommand scanner = new ExternalCommand();

    private static final Logger log = LogManager.getLogger(RemoteServicePostVirusScanValidator.class);

    @Override
    public void initialize(final Map<String, String> configuration) throws IllegalArgumentException {
        // check required configuration parameters
        for (final String parameter : new String[] {CONFIG_KEY_URL, CONFIG_KEY_VIRUS_PATTERN, CONFIG_KEY_CLEAN_PATTERN}) {
            if (!configuration.containsKey(parameter)) {
                throw new IllegalArgumentException("Configuration value '" + parameter + "' is required.");
            }
        }

        // Set Timeout
        if(configuration.containsKey(CONFIG_KEY_TIMEOUT)){
            scanner = new ExternalCommand(Integer.parseInt(configuration.get(CONFIG_KEY_TIMEOUT)));
        }

        // command parameter
        this.url = configuration.get(CONFIG_KEY_URL);

        // pattern parameters
        final String virusPattern = configuration.get(CONFIG_KEY_VIRUS_PATTERN);
        this.virusPattern = Pattern.compile(virusPattern);
        final String cleanPattern = configuration.get(CONFIG_KEY_CLEAN_PATTERN);
        this.cleanPattern = Pattern.compile(cleanPattern);
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
                throw new RemoteServiceExecutionException("Scan returned null");
            }

            // analyze result
            final Matcher virusMatcher = virusPattern.matcher(result);
            final Map<Path, String> virusList = new HashMap<>();
            while (virusMatcher.find()) {
                virusList.put(Paths.get(virusMatcher.group(1)), virusMatcher.group(2));
            }
            if (!virusList.isEmpty()) {
                log.warn("Virus found: " + result);
                throw new VirusFoundException("Virus found.", path + "/" + file, "", virusList);
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
        catch (final IOException e) {
            log.error("Virus scan failed: ", e);
        }
        catch (final RemoteServiceExecutionException e) {
            log.error("Virus scan failed: ", e);
        }
    }

    /**
     * Scan the given file
     * @param file
     * @return String
     * @throws CommandExecutionException
     */
    private String runScan(final Path file) throws IOException, ValidationException {
        HttpPost httppost = new HttpPost(this.url);
        CloseableHttpClient httpclient = HttpClientBuilder.create().build();
        FileEntity entity = new FileEntity(file.toFile());
        httppost.setEntity(entity);
        HttpResponse response = httpclient.execute(httppost);
        HttpEntity responseEntity = response.getEntity();
        String responseString = EntityUtils.toString(responseEntity, "UTF-8");
        int statusCode = response.getStatusLine().getStatusCode();

        if(statusCode == 200)
        {
            return responseString;
        }
        else
        {
            throw new ValidationException(responseString, file.toString(),  statusCode);
        }
    }
}
