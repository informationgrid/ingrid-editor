package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.JsonNode;
import de.ingrid.igeserver.db.DBApi;
import de.ingrid.igeserver.utils.AuthUtils;
import de.ingrid.igeserver.utils.DBUtils;
import org.apache.logging.log4j.LogManager;
import org.apache.logging.log4j.Logger;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import javax.annotation.Generated;
import java.io.Closeable;
import java.io.IOException;
import java.security.Principal;
import java.util.List;

@Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@RestController
@RequestMapping(path = "/api")
public class ProfileApiController implements ProfileApi {

    private static Logger log = LogManager.getLogger(ProfileApiController.class);

    @Autowired
    private DBApi dbService;

    @Autowired
    private DBUtils dbUtils;

    @Autowired
    private AuthUtils authUtils;

    @Override
    public ResponseEntity<String> getProfile(Principal principal) throws Exception {
        // ClassPathResource resource = new ClassPathResource( "/profile-uvp.chunk.js" );
        String profile = null; // new String( Files.readAllBytes( Paths.get( resource.getURI() ) ) );

        String dbId = dbUtils.getCurrentCatalogForPrincipal(principal);

        try (Closeable session = dbService.acquire(dbId)) {
            List<JsonNode> allFrom = dbService.findAll(DBApi.DBClass.Info.name());
            if (allFrom.size() > 0) {
                JsonNode map = allFrom.get(0);
                profile = map.get("profile").asText();
            } else {
                log.warn("No profiles available in database!");
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        }

        return ResponseEntity.ok(profile);
    }

    @Override
    public ResponseEntity<String> uploadProfile(Principal principal, MultipartFile file,
                                                RedirectAttributes redirectAttributes) throws IOException, ApiException {

        String dbId = dbUtils.getCurrentCatalogForPrincipal(principal);

        log.info("Received file:" + file.getOriginalFilename());
        log.info("file-size:" + file.getSize());

        String fileContent = null;
        try {
            fileContent = new String(file.getBytes());
        } catch (IOException e) {
            log.error("Could not get file content from uploaded file: " + file.getOriginalFilename(), e);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(e.getMessage());
        }

        // manipulate file content by replacing dynamic variable name with a static one
        // this way it can be used by the frontend, after it has been loaded
        fileContent = prepareProfileContent(fileContent);

        // Map<String, Object> dbFields = new HashMap<String, Object>();
        // dbFields.put( key, value )
        // dbFields.put( "fileContent", fileContent );
        try (Closeable session = dbService.acquire(dbId)) {
            List<JsonNode> infos = dbService.findAll(DBApi.DBClass.Info.name());
            if (infos.size() > 0) {
                String rid;
                try {
                    rid = infos.get(0).get("@rid").textValue();
                    dbService.remove(DBApi.DBClass.Info.name(), rid);
                } catch (Exception e) {
                    log.error("Error removing profile document", e);
                }
            }

            dbService.save(DBApi.DBClass.Info.name(), "profile", fileContent);
            return ResponseEntity.ok().build();
        }
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
        return fileContent.replaceAll("\"./src/profiles/pack.*.ts\"", "\"_profile_\"");
    }

}
