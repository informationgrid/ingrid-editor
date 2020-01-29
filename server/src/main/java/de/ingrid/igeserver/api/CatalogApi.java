/*
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api;

import de.ingrid.igeserver.model.Catalog;
import de.ingrid.igeserver.model.InlineResponseDefault;
import io.swagger.annotations.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;

import java.util.List;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Api(value = "catalogs", description = "the catalog API", hidden = true)
@RequestMapping(path = "/api")
public interface CatalogApi {

    @RequestMapping(
            value = "/catalogs",
            method = RequestMethod.GET,
            produces = {"application/json"}
    )
    @ApiOperation(value = "", notes = "", response = String.class, tags = {"Catalog"})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "", response = Void.class),
            @ApiResponse(code = 200, message = "Unexpected error", response = InlineResponseDefault.class)
    })
    ResponseEntity<List<Catalog>> getCatalogs();

    // @PreAuthorize("hasRole('admin')")
    @RequestMapping(
            value = "/catalogs",
            produces = {"application/json"},
            method = RequestMethod.POST
    )
    @ApiOperation(value = "", notes = "", response = String.class, tags = {"Catalog"})
    public ResponseEntity<Void> createCatalog(
            @ApiParam(value = "The settings of the catalog to create.", required = true) @RequestBody Catalog settings
    ) throws ApiException;

    @RequestMapping(
            value = "/catalogs/{name}",
            produces = {"application/json"},
            method = RequestMethod.PUT
    )
    @ApiOperation(value = "", notes = "", response = String.class, tags = {"Catalog"})
    public ResponseEntity<Void> updateCatalog(
            @ApiParam(value = "The name of the catalog to update.", required = true) @PathVariable("name") String name,
            @ApiParam(value = "The settings of the catalog to update.", required = true) @RequestBody Catalog settings
    ) throws ApiException;

    @RequestMapping(
            value = "/catalogs/{name}",
            produces = {"application/json"},
            method = RequestMethod.DELETE
    )
    @ApiOperation(value = "", notes = "", response = String.class, tags = {"Catalog"}, produces = "text")
    @ApiResponses(value = {
            @ApiResponse(code = 404, message = "Unknown database", response = String.class)
    })
    public ResponseEntity<Void> deleteCatalog(
            @ApiParam(value = "The name of the catalog to delete.", required = true) @PathVariable("name") String name
    ) throws ApiException;

}
