package de.ingrid.igeserver.api;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.Principal;
import java.util.List;

import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.keycloak.KeycloakPrincipal;
import org.keycloak.KeycloakSecurityContext;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.core.io.ClassPathResource;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import com.fasterxml.jackson.databind.JsonNode;

import de.ingrid.igeserver.services.JsonToDBService;
import de.ingrid.igeserver.services.db.OrientDbService;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Controller
public class ProfileApiController implements ProfileApi {

    private static Logger log = LogManager.getLogger( ProfileApiController.class );

    @Autowired
    private OrientDbService dbService;

    @Autowired
    private JsonToDBService jsonService;

    @Autowired
    private DBUtils dbUtils;

    @Override
    public ResponseEntity<String> getProfile(Principal principal) throws IOException {
        // ClassPathResource resource = new ClassPathResource( "/profile-uvp.chunk.js" );
        String profile = null; // new String( Files.readAllBytes( Paths.get( resource.getURI() ) ) );

        List<String> allFrom = dbService.getAllFrom( "Info" );
        try {
            if (allFrom.size() > 0) {
                JsonNode map = jsonService.getJsonMap( allFrom.get( 0 ) );
                profile = map.get( "profile" ).asText();
            } else {
                log.warn( "No profiles available in database!" );
                return ResponseEntity.status( HttpStatus.NOT_FOUND ).build();
            }
        } catch (Exception e) {
            // TODO Auto-generated catch block
            e.printStackTrace();
        }

        return ResponseEntity.ok( profile );
    }

    @Override
    public ResponseEntity<String> uploadProfile(Principal principal, @RequestParam("profileFile") MultipartFile file,
            RedirectAttributes redirectAttributes) {

        String userId = AuthUtils.getUsernameFromPrincipal(principal);

        String dbId = this.dbUtils.getCatalogForUser( userId );

        log.info( "Received file:" + file.getOriginalFilename() );
        log.info( "file-size:" + file.getSize() );

        String fileContent = null;
        try {
            fileContent = new String( file.getBytes() );
        } catch (IOException e) {
            log.error( "Could not get file content from uploaded file: " + file.getOriginalFilename(), e );
            return ResponseEntity.status( HttpStatus.INTERNAL_SERVER_ERROR ).body( e.getMessage() );
        }

        // manipulate file content by replacing dynamic variable name with a static one
        // this way it can be used by the frontend, after it has been loaded
        fileContent = prepareProfileContent( fileContent );

        // Map<String, Object> dbFields = new HashMap<String, Object>();
        // dbFields.put( key, value )
        // dbFields.put( "fileContent", fileContent );

        List<String> infos = dbService.getAllFrom( "Info" );
        if (infos.size() > 0) {
            String rid;
            try {
                rid = jsonService.getJsonMap( infos.get( 0 ) ).get( "@rid" ).textValue();
                dbService.deleteRawDoc( "Info", rid );
            } catch (Exception e) {
                log.error( "Error removing profile document", e );
            }
        }
        
        dbService.addRawDocTo( dbId, "Info", null, "profile", fileContent );
        return ResponseEntity.ok().build();
    }

    /**
     * Remove the id of the webpack module, which is dynamic
     * 
     * @param fileContent
     */
    private String prepareProfileContent(String fileContent) {
        // dbService.deleteDocFrom( classType, id );
        // return fileContent.replaceFirst("(.*?):(.*)", "webpackJsonp([\"_profile_\"],{\"_profile_\":$2");
        // fileContent = fileContent.replaceFirst( "(?<=\\{).*?:", "\"_profile_\":" );
        // return fileContent.replaceFirst( "(?<=\").*pack.*.ts(?=\")", "_profile_" );
        return fileContent.replaceAll( "\"./src/profiles/pack.*.ts\"", "\"_profile_\"" );
    }

}
