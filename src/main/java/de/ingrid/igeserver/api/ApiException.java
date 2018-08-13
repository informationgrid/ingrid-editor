package de.ingrid.igeserver.api;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

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
