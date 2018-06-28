/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api;

import java.security.Principal;
import java.util.List;

import javax.validation.Valid;

import org.codehaus.jettison.json.JSONObject;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

// @CrossOrigin(origins = "http://localhost:4300", maxAge = 3600)
@Api(value = "behaviours", description = "the behaviours API")
@RequestMapping(path="/api")
public interface BehavioursApi {

    @ApiOperation(value = "", notes = "", response = Void.class, tags = { "Behaviour", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Behaviours are returned.", response = Void.class) })
    @RequestMapping(value = "/behaviours", produces = { "application/json" }, method = RequestMethod.GET)
    ResponseEntity<List<JSONObject>> getBehaviours(Principal principal);

    @ApiOperation(value = "", notes = "", response = Void.class, tags = { "Behaviour", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Behaviours have been set.", response = Void.class) })
    @RequestMapping(value = "/behaviours", produces = { "application/json" }, method = RequestMethod.POST)
    ResponseEntity<String> setBehaviours(@ApiParam(value = "", required = true) @Valid @RequestBody String behaviour);

}
