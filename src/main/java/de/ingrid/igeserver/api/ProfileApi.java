/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api;

import java.io.IOException;
import java.security.Principal;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.servlet.mvc.support.RedirectAttributes;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@CrossOrigin(origins = "http://localhost:4300", maxAge = 3600)
@Api(value = "behaviours", description = "the behaviours API")
@RequestMapping(path="/api")
public interface ProfileApi {
    
    @ApiOperation(value = "", notes = "", response = Void.class, tags = { "Profile", })
    @ApiResponses(value = { @ApiResponse(code = 200, message = "", response = Void.class) })
    @RequestMapping(value = "/profiles", produces = { "text/javascript" }, method = RequestMethod.GET)
    public ResponseEntity<String> getProfile(Principal principal) throws IOException;
    
    @ApiOperation(value = "", notes = "", response = Void.class, tags = { "Profile", })
    @ApiResponses(value = { @ApiResponse(code = 200, message = "", response = Void.class) })
    @RequestMapping(value = "/profiles", produces = { "application/json" }, method = RequestMethod.POST)
    public ResponseEntity<String> uploadProfile(Principal principal, @RequestParam("file") MultipartFile file,
            RedirectAttributes redirectAttributes) throws IOException;

}
