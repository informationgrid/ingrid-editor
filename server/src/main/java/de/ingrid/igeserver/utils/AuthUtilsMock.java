package de.ingrid.igeserver.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.security.Principal;

@Service
@Profile("dev")
public class AuthUtilsMock implements AuthUtils {

    @Value("${dev.keycloak.enabled:true}")
    boolean isKeycloakEnabled;

    @Value("${dev.user.login:}")
    String mockedLogin;

    @SuppressWarnings("unused")
    public String getUsernameFromPrincipal(Principal principal) {
        // return a user for development when security is switched off
        return mockedLogin;
    }

}
