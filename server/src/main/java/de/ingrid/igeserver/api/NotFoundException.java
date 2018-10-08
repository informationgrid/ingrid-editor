package de.ingrid.igeserver.api;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@SuppressWarnings("unused")
public class NotFoundException extends ApiException {
    /**
     * 
     */
    private static final long serialVersionUID = -3519133429645192557L;
    private int code;

    public NotFoundException(int code, String msg) {
        super( code, msg );
        this.code = code;
    }
}
