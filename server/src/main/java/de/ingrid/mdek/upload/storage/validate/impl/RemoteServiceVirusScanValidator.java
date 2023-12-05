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

import com.fasterxml.jackson.annotation.JsonIgnore;
import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.annotation.JsonDeserialize;
import com.fasterxml.jackson.databind.annotation.JsonSerialize;
import com.fasterxml.jackson.databind.util.StdConverter;
import de.ingrid.mdek.upload.ValidationException;
import de.ingrid.mdek.upload.storage.validate.Validator;
import de.ingrid.mdek.upload.storage.validate.VirusFoundException;
import org.apache.http.HttpEntity;
import org.apache.http.HttpEntityEnclosingRequest;
import org.apache.http.client.methods.CloseableHttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.client.methods.HttpPost;
import org.apache.http.client.methods.HttpUriRequest;
import org.apache.http.entity.StringEntity;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.http.impl.client.HttpClients;
import org.apache.http.impl.client.LaxRedirectStrategy;
import org.apache.http.util.EntityUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;

import java.nio.file.Path;
import java.nio.file.Paths;
import java.text.SimpleDateFormat;
import java.util.Arrays;
import java.util.Date;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;

/**
 * Validator implementation that runs a virus scan on the file.
 *
 * The implementation uses a remote HTTP service.
 *
 * Required configuration
 *   - url: The base url of the service
 */
public class RemoteServiceVirusScanValidator implements Validator {

    private static final String CONFIG_KEY_URL = "url";
    private static final String URL_PATH_SEPARATOR = "/";
    private static final String SCAN_BASE_PATH = "job" + URL_PATH_SEPARATOR;

    private static final int SERVICE_REQUEST_INTERVAL = 1000;

    private static final SimpleDateFormat df = new SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'");

    private static final ThreadLocal<HttpClientBuilder> clientBuilder = new ThreadLocal<HttpClientBuilder>() {
        @Override
        protected HttpClientBuilder initialValue() {
            try {
                return HttpClients.custom().setRedirectStrategy(new LaxRedirectStrategy());
            }
            catch (final Exception e) {
                throw new IllegalArgumentException("Failed to initialize HTTP client builder: ", e);
            }
        }
    };
    private static final ThreadLocal<ObjectMapper> objectMapper = new ThreadLocal<ObjectMapper>() {
        @Override
        protected ObjectMapper initialValue() {
            final ObjectMapper objectMapper = new ObjectMapper();
            objectMapper.setDateFormat(df);
            return objectMapper;
        }
    };

    private String serviceBaseUrl;
    private String scanBaseUrl;

    private static final Logger log = LogManager.getLogger(RemoteServiceVirusScanValidator.class);

    /**
     * Remote service interface
     */

    private static enum ScanType {
        @JsonProperty("sync") SYNC,
        @JsonProperty("async") ASYNC
    }

    private static enum ScanStatus {
        @JsonProperty("running") RUNNING,
        @JsonProperty("finished") FINISHED
    }

    private static enum ScanResultCode {
        @JsonProperty("ok") OK,
        @JsonProperty("infected") INFECTED,
        @JsonProperty("failure") FAILURE,
        @JsonProperty("undefined") UNDEFINED
    }

    private static class InfectionDetail {
        public String location;
        public String virus;
    }

    private static class ScanResult {
        public ScanStatus status;
        public ScanResultCode result;
        public String report;
        public List<InfectionDetail> infections;
    }

    @SuppressWarnings("unused")
    private static class ServiceResponse {
        public String id;
        public Date date;
        @JsonDeserialize(converter=ResourceToPathConverter.class)
        public Path resource;
        public ScanType type;
        public ScanResult scan;
        public boolean complete;
        @JsonIgnore
        public ScanStatus getScanStatus() {
            return scan != null ? scan.status : ScanStatus.FINISHED;
        }
        @JsonIgnore
        public ScanResultCode getScanResult() {
            return scan != null ? scan.result : ScanResultCode.UNDEFINED;
        }
        @JsonIgnore
        public String getScanReport() {
            return scan != null ? scan.report : "";
        }
        @JsonIgnore
        public Map<Path, String> getInfections() {
            final Map<Path, String> result = new HashMap<>();
            final ResourceToPathConverter pathConverter = new ResourceToPathConverter();
            if (scan != null) {
                for (final InfectionDetail infection : scan.infections) {
                    result.put(pathConverter.convert(infection.location), infection.virus);
                }
            }
            return result;
        }
    }

    @SuppressWarnings("unused")
    private static class ServiceRequest {
        @JsonSerialize(converter=PathToResourceConverter.class)
        public Path resource;
        public ScanType type;
    }

    private static class PathToResourceConverter extends StdConverter<Path, String> {
        @Override
        public String convert(final Path value) {
            return value != null ? (!value.startsWith(URL_PATH_SEPARATOR) ? URL_PATH_SEPARATOR : "") +
                    String.join(URL_PATH_SEPARATOR,  value.toString().split(Matcher.quoteReplacement(System.getProperty("file.separator")))) : "";
        }
    }

    private static class ResourceToPathConverter extends StdConverter<String, Path> {
        private static final String[] EMPTY_PARTS = new String[] {};
        @Override
        public Path convert(final String value) {
            final String[] parts = value != null ? (value.startsWith(URL_PATH_SEPARATOR) ? value.substring(1) : value.substring(0)).split(URL_PATH_SEPARATOR) : EMPTY_PARTS;
            return parts.length > 0 ? (parts.length > 1 ? Paths.get(parts[0], Arrays.copyOfRange(parts, 1, parts.length)) : Paths.get(parts[0])) : null;
        }
    }

    @Override
    public void initialize(final Map<String, String> configuration) throws IllegalArgumentException {
        // check required configuration parameters
        for (final String parameter : new String[] {CONFIG_KEY_URL}) {
            if (!configuration.containsKey(parameter)) {
                throw new IllegalArgumentException("Configuration value '"+parameter+"' is required.");
            }
        }

        serviceBaseUrl = configuration.get(CONFIG_KEY_URL);
        scanBaseUrl = serviceBaseUrl + (!serviceBaseUrl.endsWith(URL_PATH_SEPARATOR) ? URL_PATH_SEPARATOR: "") + SCAN_BASE_PATH;
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

        // scan file or directory
        ServiceResponse response = sendScanRequest(data);
        if (response != null) {
            if (log.isDebugEnabled()) {
                log.debug("Running " + response.type + " virus scan on resource " + data + " [id:" + response.id + "]");
            }

            // wait for asynchronous scan to finish
            while (response.type == ScanType.ASYNC && response.getScanStatus() == ScanStatus.RUNNING) {
                if (log.isDebugEnabled()) {
                    log.debug("Waiting for scan [id:" + response.id + "] to finish");
                }
                try {
                    Thread.sleep(SERVICE_REQUEST_INTERVAL);
                }
                catch (final InterruptedException e) {}
                response = getScanStatus(response.id);
                if (response == null) {
                    break;
                }
            }

            // analyze result
            if (response != null) {
                final ScanResultCode resultCode = response.getScanResult();
                if (resultCode == ScanResultCode.INFECTED) {
                    final Map<Path, String> infections = response.getInfections();
                    log.warn("Virus found: " + response.getScanReport());
                    throw new VirusFoundException("Virus found.", path+URL_PATH_SEPARATOR+file, infections);
                }
                else if (resultCode != ScanResultCode.OK) {
                    log.error("Virus scan failed: " + response.getScanReport());
                }
                else {
                    if (log.isDebugEnabled()) {
                        log.debug("Scan result: " + response.getScanReport());
                    }
                }
            }
        }
    }

    private ServiceResponse sendScanRequest(final Path path) {
        try {
            final ScanType scanType = path.toFile().isDirectory() ? ScanType.ASYNC : ScanType.SYNC;

            final ObjectMapper objectMapper = getObjectMapper();
            final HttpPost request = new HttpPost(scanBaseUrl);
            request.setHeader("Accept", "application/json");
            request.setHeader("Content-type", "application/json");

            final ServiceRequest serviceRequest = new ServiceRequest();
            serviceRequest.resource = path;
            serviceRequest.type = scanType;

            final String requestBody = objectMapper.writeValueAsString(serviceRequest);
            request.setEntity(new StringEntity(requestBody));

            final String responseBody = sendRequest(request);
            final ServiceResponse serviceResponse = getObjectMapper().readValue(responseBody, ServiceResponse.class);

            return serviceResponse;
        }
        catch (final Exception e) {
            log.error("Virus scan failed: ", e);
        }
        return null;
    }

    private ServiceResponse getScanStatus(final String id) {
        try {
            final ObjectMapper objectMapper = getObjectMapper();

            final HttpGet request = new HttpGet(scanBaseUrl + id);
            request.setHeader("Accept", "application/json");

            final String responseBody = sendRequest(request);
            final ServiceResponse serviceResponse = objectMapper.readValue(responseBody, ServiceResponse.class);

            return serviceResponse;
        }
        catch (final Exception e) {
            log.error("Virus scan failed: ", e);
        }
        return null;
    }

    private String sendRequest(final HttpUriRequest request) throws Exception {
        if (log.isDebugEnabled()) {
            log.debug("Service request: " + request.toString() + " - " + (request instanceof HttpEntityEnclosingRequest ? EntityUtils.toString(((HttpEntityEnclosingRequest)request).getEntity()) : ""));
        }
        try (final CloseableHttpClient serviceClient = clientBuilder.get().build();
             final CloseableHttpResponse response = serviceClient.execute(request)
             ) {
            final int status = response.getStatusLine().getStatusCode();
            if (status != 200) {
                log.error("Virus scan service invocation failed: ", response);
                throw new RemoteServiceExecutionException("Virus scan service invocation on '" + request.getURI() + "' failed with code: " + status);
            }

            final HttpEntity responseEntity = response.getEntity();
            final String responseBody = EntityUtils.toString(responseEntity);
            if (log.isDebugEnabled()) {
                log.debug("Service response: " + responseBody);
            }
            return responseBody;
        }
    }

    private static ObjectMapper getObjectMapper() {
        return objectMapper.get();
    }
}
