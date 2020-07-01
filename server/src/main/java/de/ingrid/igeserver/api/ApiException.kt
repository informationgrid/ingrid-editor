package de.ingrid.igeserver.api;


public class ApiException extends Exception {
    /**
     * 
     */
    private static final long serialVersionUID = 3021618705523682976L;
    
    private int code;

    private boolean hideStacktrace = false;

    public ApiException(String msg) {
        super(msg);
        this.code = 500;
    }

    public ApiException(String msg, boolean doNotShowStacktrace) {
        super(msg);
        this.code = 500;
        this.hideStacktrace = doNotShowStacktrace;
    }


    public ApiException(int code, String msg) {
        super( msg );
        this.code = code;
    }

    public boolean isHideStacktrace() {
        return hideStacktrace;
    }

    public void setHideStacktrace(boolean hideStacktrace) {
        this.hideStacktrace = hideStacktrace;
    }
}
