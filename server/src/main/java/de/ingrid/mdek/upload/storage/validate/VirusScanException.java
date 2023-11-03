package de.ingrid.mdek.upload.storage.validate;

import de.ingrid.mdek.upload.ValidationException;

/**
 * when an error -that do not throw an exception- is found during a scan
 * record all logs output of the scan
 */
public class VirusScanException extends ValidationException {
    private static final int STATUS_CODE = 419;

    private static final long serialVersionUID = 1L;
    private static final String SCAN_EXCEPTION_KEY = "scanReport";

    public VirusScanException(final String message, final String file, final String scanReport) {
        super(message, file, STATUS_CODE);
        this.data.put(SCAN_EXCEPTION_KEY, scanReport);
    }

    /**
     * Get the whole log returned by the virus scan
     * @return String
     */
    @SuppressWarnings("unchecked")
    public String getScanReport() {
        return (String)this.data.get(SCAN_EXCEPTION_KEY);
    }
}

