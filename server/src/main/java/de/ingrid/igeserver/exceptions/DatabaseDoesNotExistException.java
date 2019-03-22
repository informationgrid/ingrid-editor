package de.ingrid.igeserver.exceptions;

public class DatabaseDoesNotExistException extends RuntimeException {
    public DatabaseDoesNotExistException(String message) {
        super(message);
    }
}
