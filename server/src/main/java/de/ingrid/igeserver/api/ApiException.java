package de.ingrid.igeserver.api;


public class ApiException extends Exception {
    /**
     * 
     */
    private static final long serialVersionUID = 3021618705523682976L;
    
    private int code;

    public ApiException(String msg) {
        super(msg);
        this.code = 500;
    }

    public ApiException(int code, String msg) {
        super( msg );
        this.code = code;
    }
}
