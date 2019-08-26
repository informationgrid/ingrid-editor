package de.ingrid.igeserver.services;

import de.ingrid.igeserver.model.User;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Profile;
import org.springframework.stereotype.Service;

import java.security.Principal;
import java.util.*;

@Service
@Profile("dev")
public class KeycloakMockService implements UserManagementService {

    private Logger log = LogManager.getLogger(KeycloakMockService.class);

    @Value("${dev.user.roles:}")
    String[] mockedUserRoles;

    @Value("${dev.user.login:}")
    String mockedLogin;

    @Value("${dev.user.firstName:}")
    String mockedFirstName;

    @Value("${dev.user.lastName:}")
    String mockedLastName;


    public List<User> getUsers(Principal principal) {

        List<User> mockUsers = new ArrayList<>();
        User user = new User();
        user.setLogin(mockedLogin);
        user.setFirstName(mockedFirstName);
        user.setLastName(mockedLastName);
        mockUsers.add(user);
        return mockUsers;
    }

    @Override
    public Set<String> getRoles(KeycloakAuthenticationToken principal) {
        return new HashSet<>(Arrays.asList(mockedUserRoles));
    }

    @Override
    public String getName(KeycloakAuthenticationToken principal) {
        return "Michael Mustermann";
    }


    @Override
    public User getUser(Principal principal, String login) {
        User user = new User();
        user.setLogin("admin");
        user.setFirstName("Mocked");
        user.setLastName("User");
        return user;
    }

}
