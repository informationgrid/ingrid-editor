package de.ingrid.igeserver.api;

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
