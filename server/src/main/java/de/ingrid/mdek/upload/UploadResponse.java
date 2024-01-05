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

import java.util.List;
import java.util.Map;

public class UploadResponse {

    private boolean success = true;
    private String errorText = null;
    private String message = null;
    private Map<String, Object> errorData = null;
    private List<StorageItem> files = null;

    /**
     * Success constructor
     */
    public UploadResponse() {}

    /**
     * Success constructor with uploaded files
     * @param files File items
     */
    public UploadResponse(List<StorageItem> files) {
        this.files = files;
    }

    /**
     * Error constructor
     * @param ex The exception
     */
    public UploadResponse(Throwable ex) {
        this.success = false;
        this.errorText = ex.getClass().getSimpleName();
        this.message = ex.getMessage();
        if (ex instanceof UploadException) {
            this.errorData = ((UploadException)ex).getData();
        }
    }

    /**
     * Set the status property
     * @param success
     */
    public void setSuccess(boolean success) {
        this.success = success;
    }

    /**
     * Get the success property
     * @return boolean
     */
    public boolean getSuccess() {
        return this.success;
    }

    /**
     * Set the error text
     * @param errorText
     */
    public void setErrorText(String errorText) {
        this.errorText = errorText;
    }

    /**
     * Get the error text
     * @return String
     */
    public String getErrorText() {
        return this.errorText;
    }


    /**
     * Set the error message
     * @param message
     */
    public void setMessage(String message) {
        this.message = message;
    }

    /**
     * Get the error message
     * @return String
     */
    public String getMessage() {
        return this.message;
    }

    /**
     * Set the error data
     * @param data
     */
    public void setErrorData(Map<String, Object> data) {
        this.errorData = data;
    }

    /**
     * Get the error data
     * @return Map<String, String>
     */
    public Map<String, Object> getErrorData() {
        return this.errorData;
    }

    /**
     * Set the files
     * @param files
     */
    public void setFiles(List<StorageItem> files) {
        this.files = files;
    }

    /**
     * Get the files
     * @return List<Item>
     */
    public List<StorageItem> getFiles() {
        return this.files;
    }
}
