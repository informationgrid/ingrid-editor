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

import de.ingrid.igeserver.model.User;
import de.ingrid.igeserver.model.User1;
import io.swagger.annotations.Api;
import io.swagger.annotations.ApiOperation;
import io.swagger.annotations.ApiParam;
import io.swagger.annotations.ApiResponse;
import io.swagger.annotations.ApiResponses;
@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@CrossOrigin(origins = "http://localhost:4300", maxAge = 3600)
@Api(value = "users", description = "the users API")
@RequestMapping(path="/api")
public interface UsersApi {

    @ApiOperation(value = "Create a new user. If the user already exists an error will be returned.", notes = "", response = Void.class, tags={ "User", })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "User was successfully updated", response = Void.class),
        @ApiResponse(code = 406, message = "A user with the given login does not exist and cannot be updated", response = Void.class) })
    
    @RequestMapping(value = "/users/{id}",
        produces = { "application/json" }, 
        method = RequestMethod.POST)
    ResponseEntity<Void> createUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id,@ApiParam(value = "Save the user data into the database." ,required=true )  @Valid @RequestBody User1 user);


    @ApiOperation(value = "Deletes a user.", notes = "The user with the given ID is deleted. If user with a given login does not exists an error will be returned.", response = Void.class, tags={ "User", })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "User was successfully deleted", response = Void.class),
        @ApiResponse(code = 406, message = "A user with the given login does not exist and cannot be deleted", response = Void.class) })
    
    @RequestMapping(value = "/users/{id}", produces = { "application/json" }, 
        method = RequestMethod.DELETE)
    ResponseEntity<Void> deleteUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id);


    @ApiOperation(value = "", notes = "", response = Void.class, tags={ "User" })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "Options for this operation are returned.", response = Void.class) })
    
    @RequestMapping(value = "/users",
        produces = { "application/json" }, 
        method = RequestMethod.OPTIONS)
    ResponseEntity<Void> get();


    @ApiOperation(value = "", notes = "Get the user with the given ID.", response = Void.class, tags={ "User", })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "Returns the user", response = Void.class) })
    
    @RequestMapping(value = "/users/{id}",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<Void> getUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id);


    @ApiOperation(value = "", notes = "", response = Void.class, tags={ "User" })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "Options for this operation are returned.", response = Void.class) })
    
    @RequestMapping(value = "/users/{id}",
        produces = { "application/json" }, 
        method = RequestMethod.OPTIONS)
    ResponseEntity<Void> getUserOp(@ApiParam(value = "",required=true ) @PathVariable("id") String id);


    @ApiOperation(value = "", notes = "", response = Void.class, tags={ "User", })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "Returns the list of users", response = Void.class) })
    
    @RequestMapping(value = "/users",
        produces = { "application/json" }, 
        method = RequestMethod.GET)
    ResponseEntity<Void> list();


    @ApiOperation(value = "Updates an existing user user. If the user does not exist an error will be returned.", notes = "", response = Void.class, tags={ "User", })
    @ApiResponses(value = { 
        @ApiResponse(code = 200, message = "User was successfully created", response = Void.class),
        @ApiResponse(code = 406, message = "A user already exists with the given login", response = Void.class) })
    
    @RequestMapping(value = "/users/{id}",
        produces = { "application/json" }, 
        method = RequestMethod.PUT)
    ResponseEntity<Void> updateUser(@ApiParam(value = "The unique login of the user.",required=true ) @PathVariable("id") String id,@ApiParam(value = "Save the user data into the database." ,required=true )  @Valid @RequestBody User user);

}
