package de.ingrid.igeserver.services;

import de.ingrid.igeserver.model.User;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;

import java.io.IOException;
import java.security.Principal;
import java.util.List;
import java.util.Set;

public interface UserManagementService {
    List<User> getUsers(Principal principal) throws IOException;

    User getUser(String login);

    Set<String> getRoles(KeycloakAuthenticationToken principal);
}
