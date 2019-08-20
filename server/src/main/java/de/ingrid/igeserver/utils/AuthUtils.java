package de.ingrid.igeserver.utils;

import de.ingrid.igeserver.api.ApiException;

import java.security.Principal;

public interface AuthUtils {
    String getUsernameFromPrincipal(Principal principal) throws ApiException;
}
