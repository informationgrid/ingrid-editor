package de.ingrid.igeserver.api;

import java.io.InputStream;
import java.security.Principal;
import java.util.ArrayList;
import java.util.List;

import javax.validation.Valid;

import org.apache.http.HttpEntity;
import org.apache.http.HttpResponse;
import org.apache.http.client.methods.HttpGet;
import org.apache.http.impl.client.CloseableHttpClient;
import org.apache.http.impl.client.HttpClientBuilder;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.adapters.springsecurity.token.KeycloakAuthenticationToken;
import org.keycloak.representations.AccessTokenResponse;
import org.keycloak.representations.idm.UserRepresentation;
import org.keycloak.util.JsonSerialization;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;

import de.ingrid.igeserver.model.User;
import de.ingrid.igeserver.model.User1;
import io.swagger.annotations.ApiParam;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")


@Controller
public class UsersApiController implements UsersApi {
    
    //@Autowired
    //private DocumentService jsonService;
    
    static class UserList extends ArrayList<UserRepresentation> {

        /**
         * 
         */
        private static final long serialVersionUID = -5810388584187302144L;
        
    }
    private static Logger log = LogManager.getLogger(UsersApiController.class);

    @Value("${keycloak.auth-server-url}")
    private String keycloakUrl;
    
    @Value("${keycloak.realm}")
    private String keycloakRealm;


    public ResponseEntity<Void> createUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id,
        @ApiParam(value = "Save the user data into the database." ,required=true )  @Valid @RequestBody User1 user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> deleteUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> get() {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<Void> getUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

    public ResponseEntity<List<User>> list(Principal principal, AccessTokenResponse res) {
        
        if (principal == null) {
            log.warn( "No principal found in request!" );
            return ResponseEntity.status( HttpStatus.UNAUTHORIZED ).build();
        }
        
        try (CloseableHttpClient client = HttpClientBuilder.create().build()) {
       
            KeycloakAuthenticationToken keycloakPrincipal = (KeycloakAuthenticationToken) principal;
            
            HttpGet get = new HttpGet( keycloakUrl + "/admin/realms/" + keycloakRealm + "/users");
            get.addHeader("Authorization", "Bearer " + keycloakPrincipal.getAccount().getKeycloakSecurityContext().getTokenString());
            
            HttpResponse response = client.execute(get);
            
            if (response.getStatusLine().getStatusCode() != 200) {
                log.error( "Response was not ok! => " + response.getStatusLine().getStatusCode() );
                return ResponseEntity.status( response.getStatusLine().getStatusCode() ).body( null );
            }
            
            HttpEntity entity = response.getEntity();
            InputStream is = entity.getContent();

            try {
                UserList users = JsonSerialization.readValue(is, UserList.class);
                List<User> igeUsers = mapUsers(users);
                return ResponseEntity.ok( igeUsers );
                
            } catch(Exception ex) {
                log.error( "Could not get users from keycloak endpoint", ex );
            } finally {
                is.close();
            }
            
        } catch (Exception e) {
            log.error( "Problem getting users from keycloak",  e );
        }
        
        return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).build();
    }

    private List<User> mapUsers(UserList users) {
        ArrayList<User> list = new ArrayList<User>();
        
        users.forEach( user -> {
            User u = new User();
            u.setLogin( user.getUsername() );
            u.setFirstName( user.getFirstName() );
            u.setLastName( user.getLastName() );
            list.add( u );
        });
        return list;
    }

    public ResponseEntity<Void> updateUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id,
        @ApiParam(value = "Save the user data into the database." ,required=true )  @Valid @RequestBody User user) {
        // do some magic!
        return new ResponseEntity<Void>(HttpStatus.OK);
    }

}
