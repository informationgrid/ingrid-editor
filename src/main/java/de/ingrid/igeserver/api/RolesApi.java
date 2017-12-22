/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api;

import javax.validation.Valid;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import de.ingrid.igeserver.model.Role;
import de.ingrid.igeserver.model.Role1;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@CrossOrigin(origins = "http://localhost:4300", maxAge = 3600)
@Api(value = "roles", description = "the roles API")
@RequestMapping(path="/api")
public interface RolesApi {

    @ApiOperation(value = "Creates a new role. If role with a given login already exists an error will be returned.", notes = "", response = Void.class, tags = { "Role", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Role was successfully updated", response = Void.class),
            @ApiResponse(code = 406, message = "A role with the given login does not exist and cannot be updated", response = Void.class) })

    @RequestMapping(value = "/roles/{id}", produces = { "application/json" }, method = RequestMethod.POST)
    ResponseEntity<Void> createRole(@ApiParam(value = "The unique id of the user.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "Save the role into the database.", required = true) @Valid @RequestBody Role1 role);

    @ApiOperation(value = "Deletes a role.", notes = "Delete a role with a given ID. If role with a given id does not exists an error will be returned.", response = Void.class, tags = { "Role", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Role was successfully deleted", response = Void.class),
            @ApiResponse(code = 406, message = "A role with the given id does not exist and cannot be deleted", response = Void.class) })

    @RequestMapping(value = "/roles/{id}", produces = { "application/json" }, method = RequestMethod.DELETE)
    ResponseEntity<Void> deleteRole(@ApiParam(value = "The unique id of the role.", required = true) @PathVariable("id") String id);

    @ApiOperation(value = "Get a role", notes = "Get the role with the given ID.", response = Void.class, tags = { "Role", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Returns the role", response = Void.class) })

    @RequestMapping(value = "/roles/{id}", produces = { "application/json" }, method = RequestMethod.GET)
    ResponseEntity<String> getRole(@ApiParam(value = "The unique id of the role.", required = true) @PathVariable("id") String id);

    @ApiOperation(value = "", notes = "", response = Void.class, tags = {"Role"})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Options for this operation are returned.", response = Void.class) })

    @RequestMapping(value = "/roles/{id}", produces = { "application/json" }, method = RequestMethod.OPTIONS)
    ResponseEntity<Void> getRoleOp(@ApiParam(value = "", required = true) @PathVariable("id") String id);

    @ApiOperation(value = "", notes = "", response = Void.class, tags = {"Role"})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Options for this operation are returned.", response = Void.class) })

    @RequestMapping(value = "/roles", produces = { "application/json" }, method = RequestMethod.OPTIONS)
    ResponseEntity<Void> getRolesOp();

    @ApiOperation(value = "", notes = "", response = Void.class, tags = { "Role", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Returns the list of roles", response = Void.class) })

    @RequestMapping(value = "/roles", produces = { "application/json" }, method = RequestMethod.GET)
    ResponseEntity<String> listRoles();

    @ApiOperation(value = "Updates a role. If role could not be found an error will be returned.", notes = "", response = Void.class, tags = { "Role", })
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Role was successfully created", response = Void.class),
            @ApiResponse(code = 406, message = "A role already exists with the given login", response = Void.class) })

    @RequestMapping(value = "/roles/{id}", produces = { "application/json" }, method = RequestMethod.PUT)
    ResponseEntity<Void> updateRole(@ApiParam(value = "The unique id of the role.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "Save the role into the database.", required = true) @Valid @RequestBody Role role);

}
