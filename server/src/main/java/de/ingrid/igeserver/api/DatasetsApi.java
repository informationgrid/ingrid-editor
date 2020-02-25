/**
 * NOTE: This class is auto generated by the swagger code generator program (2.2.3).
 * https://github.com/swagger-api/swagger-codegen
 * Do not edit the class manually.
 */
package de.ingrid.igeserver.api;

import com.fasterxml.jackson.databind.node.ObjectNode;
import de.ingrid.igeserver.model.Data1;
import de.ingrid.igeserver.model.InlineResponse200;
import de.ingrid.igeserver.model.InlineResponseDefault;
import de.ingrid.igeserver.model.SearchResult;
import io.swagger.annotations.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import javax.validation.Valid;
import java.io.IOException;
import java.security.Principal;
import java.util.List;

@javax.annotation.Generated(value = "io.swagger.codegen.languages.SpringCodegen", date = "2017-08-21T10:21:42.666Z")

@Api(value = "datasets", description = "the datasets API")
@RequestMapping(path = "/api")
public interface DatasetsApi {

    @RequestMapping(
            value = "/datasets", produces = {"application/json"}, method = RequestMethod.POST
    )
    @ApiOperation(value = "Create a complete dataset", notes = "xxx", response = Void.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "The stored dataset, which might contain additional storage information.", response = Void.class),
            @ApiResponse(code = 200, message = "Unexpected error", response = InlineResponseDefault.class)})
    ResponseEntity<String> createDataset(
            Principal principal,
            @ApiParam(value = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @ApiParam(value = "Is this an address document") @Valid @RequestParam(required = false) boolean address,
            @ApiParam(value = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish) throws ApiException;

    @ApiOperation(value = "Update a complete dataset", notes = "xxx", response = Void.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "The stored dataset, which might contain additional storage information.", response = Void.class),
            @ApiResponse(code = 200, message = "Unexpected error", response = InlineResponseDefault.class)})
    @RequestMapping(value = "/datasets/{id}", produces = {"application/json"}, method = RequestMethod.PUT)
    ResponseEntity<String> updateDataset(
            Principal principal,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "The dataset to be stored.", required = true) @Valid @RequestBody String data,
            @ApiParam(value = "If we want to store the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) boolean publish,
            @ApiParam(value = "Delete the draft version and make the published version the current one.") @RequestParam(value = "revert", required = false) boolean revert,
            @ApiParam(value = "Delete an address.") @RequestParam(value = "address", required = false) boolean forAddress) throws ApiException;


    @ApiOperation(value = "Copy a dataset or tree under another dataset", notes = "xxx", response = Void.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Datasets have been copied successfully.", response = Void.class)})
    @RequestMapping(value = "/datasets/{ids}/copy", produces = {"application/json"}, method = RequestMethod.POST)
    ResponseEntity<Void> copyDatasets(
            Principal principal,
            @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
            @ApiParam(value = "...", required = true) @Valid @RequestBody Data1 data);

    @ApiOperation(value = "Deletes a dataset", notes = "...", response = Void.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "", response = Void.class),
            @ApiResponse(code = 200, message = "Unexpected error", response = InlineResponseDefault.class)})
    @RequestMapping(value = "/datasets/{id}", produces = {"application/json"}, method = RequestMethod.DELETE)
    ResponseEntity<String> deleteById(
            Principal principal,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String[] ids,
            @ApiParam(value = "Delete an address document") @RequestParam(value = "address", required = false) boolean address) throws ApiException;

    @ApiOperation(value = "Export a dataset to a specific format", notes = "...", response = Void.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Dataset has been exported successfully.", response = Void.class)})
    @RequestMapping(value = "/datasets/{id}/export/{format}", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<String> exportDataset(
            Principal principal,
            @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("id") String id,
            @ApiParam(value = "e.g. ISO", required = true) @PathVariable("format") String format) throws ApiException, IOException;

    @ApiOperation(value = "Get child datasets of a given parent document/folder", notes = "", response = Void.class, tags = {
            "Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Child Datasets found", response = Void.class)})
    @RequestMapping(value = "/tree/children", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<List<ObjectNode>> getChildren(
            Principal principal,
            @ApiParam(value = "The ID of the parent dataset to get the children from. If empty then the root datasets are returned.")
            @RequestParam(value = "parentId", required = false) String parentId,
            @ApiParam(value = "Define if we want to have addresses or documents.")
            @RequestParam(value = "address", required = false) boolean isAddress) throws Exception;

    @ApiOperation(value = "Get datasets by a query", notes = "Get all datasets or those which match a given query. The results can also be sorted.", response = Void.class, tags = {
            "Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Datasets found", response = Void.class)})
    @RequestMapping(value = "/datasets", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<SearchResult> find(
            Principal principal,
            @ApiParam(value = "Find datasets by a search query.") @RequestParam(value = "query", required = false) String query,
            @ApiParam(value = "Define the maximum number of returned documents.") @RequestParam(value = "size", required = false) Integer size,
            @ApiParam(value = "Sort by a given field.") @RequestParam(value = "sort", required = false) String sort,
            @ApiParam(value = "Define the sort order.") @RequestParam(value = "sortOrder", required = false, defaultValue = "ASC") String sortOrder,
            @ApiParam(value = "Search in addresses.") @RequestParam(value = "address", required = false) boolean forAddress) throws Exception;

    @ApiOperation(value = "A complete dataset", notes = "Retrieve a dataset by a given ID.", response = InlineResponse200.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "The dataset with the given ID.", response = InlineResponse200.class),
            @ApiResponse(code = 200, message = "Unexpected error", response = InlineResponseDefault.class)})
    @RequestMapping(value = "/datasets/{id}", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<String> getByID(
            Principal principal,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "If we want to get the published version then this parameter has to be set to true.") @RequestParam(value = "publish", required = false) Boolean publish,
            @ApiParam(value = "Get an address instead of a document") @RequestParam(value = "address", required = false) boolean forAddress) throws Exception;

    @ApiOperation(value = "Get the hierarchical path of a document", notes = "Retrieve an array of ID of all parents leading to the given dataset ID.", response = Void.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Array of IDs.", response = Void.class)})
    @RequestMapping(value = "/datasets/{id}/path", produces = {"application/json"}, method = RequestMethod.GET)
    ResponseEntity<List<String>> getPath(
            Principal principal,
            @ApiParam(value = "The ID of the dataset.", required = true) @PathVariable("id") String id,
            @ApiParam(value = "The path for addresses") @RequestParam(value = "address", required = false) boolean forAddress) throws ApiException;

    @ApiOperation(value = "Move a dataset or tree under another dataset", notes = "xxx", response = Void.class, tags = {"Datasets",})
    @ApiResponses(value = {
            @ApiResponse(code = 200, message = "Datasets have been moved successfully.", response = Void.class)})
    @RequestMapping(value = "/datasets/{ids}/move", produces = {"application/json"}, method = RequestMethod.POST)
    ResponseEntity<Void> moveDatasets(
            Principal principal,
            @ApiParam(value = "IDs of the copied datasets", required = true) @PathVariable("ids") List<String> ids,
            @ApiParam(value = "...", required = true) @Valid @RequestBody Data1 data) throws Exception;

}
