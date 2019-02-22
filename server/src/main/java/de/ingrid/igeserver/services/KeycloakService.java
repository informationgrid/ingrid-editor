package de.ingrid.igeserver.services;

import de.ingrid.igeserver.model.User;
import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.idm.UserRepresentation;
import org.keycloak.util.JsonSerialization;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import javax.naming.NoPermissionException;
import java.io.IOException;
import java.io.InputStream;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;

@Service
//@Profile("!dev")
public class KeycloakService implements UserManagementService {

    private Logger log = LogManager.getLogger(KeycloakService.class);

    @Value("${keycloak.auth-server-url}")
    private String keycloakUrl;

    @Value("${keycloak.realm}")
    private String keycloakRealm;

    private static class UserList extends ArrayList<UserRepresentation> {
        private static final long serialVersionUID = -5810388584187302144L;
    }

    public List<User> getUsers(Principal principal) throws IOException, NoPermissionException {

        try (CloseableHttpClient client = HttpClientBuilder.create().build()) {
            HttpGet get = new HttpGet(keycloakUrl + "/admin/realms/" + keycloakRealm + "/users");
            KeycloakAuthenticationToken keycloakPrincipal = (KeycloakAuthenticationToken) principal;
            get.addHeader("Authorization", "Bearer " + keycloakPrincipal.getAccount().getKeycloakSecurityContext().getTokenString());

            HttpResponse response = client.execute(get);

            int statusCode = response.getStatusLine().getStatusCode();
            if (statusCode != 200) {
                log.error("Response was not ok! => " + statusCode);
                if (statusCode == 403) {
                    throw new NoPermissionException("You have no permission to get users from keycloak: " + response.getStatusLine().getReasonPhrase());
                } else {
                    throw new RuntimeException("Error getting users from keycloak: " + response.getStatusLine().getReasonPhrase());
                }
            }

            HttpEntity entity = response.getEntity();

            try (InputStream is = entity.getContent()) {
                UserList users = JsonSerialization.readValue(is, UserList.class);
                return mapUsers(users);

            } catch (Exception ex) {
                log.error("Could not get users from keycloak endpoint", ex);
                throw ex;
            }

        } catch (Exception e) {
            log.error("Problem getting users from keycloak", e);
            throw e;
        }
    }

    @Override
    public User getUser(Principal principal, String login) throws IOException {
        try (CloseableHttpClient client = HttpClientBuilder.create().build()) {
            HttpGet get = new HttpGet(keycloakUrl + "/admin/realms/" + keycloakRealm + "/users/" + login);
            KeycloakAuthenticationToken keycloakPrincipal = (KeycloakAuthenticationToken) principal;
            get.addHeader("Authorization", "Bearer " + keycloakPrincipal.getAccount().getKeycloakSecurityContext().getTokenString());

            HttpResponse response = client.execute(get);

            if (response.getStatusLine().getStatusCode() != 200) {
                log.error("Response was not ok! => " + response.getStatusLine().getStatusCode());
                throw new RuntimeException("Keycloak User Request for login: " + login + " => " + response.getStatusLine().getReasonPhrase());
                // return null;
            }

            HttpEntity entity = response.getEntity();

            try (InputStream is = entity.getContent()) {
                UserRepresentation user = JsonSerialization.readValue(is, UserRepresentation.class);
                return mapUser(user);

            } catch (Exception ex) {
                log.error("Could not get users from keycloak endpoint", ex);
                throw ex;
            }

        } catch (Exception e) {
            log.error("Problem getting users from keycloak", e);
            throw e;
        }
    }

    private User mapUser(UserRepresentation user) {
        User mappedUser = new User();
        mappedUser.setLogin(user.getUsername());
        mappedUser.setFirstName(user.getFirstName());
        mappedUser.setLastName(user.getLastName());
        mappedUser.setId(user.getId());
        return mappedUser;
    }

    private List<User> mapUsers(KeycloakService.UserList users) {
        ArrayList<User> list = new ArrayList<>();

        users.forEach(user -> list.add(mapUser(user)) );
        return list;
    }

    public Set<String> getRoles(KeycloakAuthenticationToken principal) {
        return principal == null ? null : principal.getAccount().getRoles();
    }
}
